import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { Room } from "models/room";
import { User } from "models/user";
import ws, * as WebSocket from 'ws';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { APIError, errorHandler } from "./middleware/errorHandler";
import { loggerMiddleware } from "./middleware/logger";
import routes from "./routes";
import { generateLocalToken } from "./utils/jwt";

dotenv.config();

const app = express();

app.use(express.json());
// compresses all the responses
app.use(compression());
// adding set of security middlewares
app.use(helmet());
// parse incoming request body and append data to `req.body`
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// enable all CORS request 
app.use(cors());

app.use("/api", routes);

// use application-level middleware for all API endpoints
app.use(loggerMiddleware);

app.use(async (err: APIError, req: Request, res: Response, next: NextFunction) => {
    if (!errorHandler.isTrustedError(err)) {
        next(err);
    }
    await errorHandler.handleError(err);
    errorHandler.returnError(err, req, res, next);
});

const connections: Map<string, Set<WebSocket>> = new Map();
const ySocketConnections: Map<string, WebsocketProvider> = new Map();
const userConnections: Map<string, Set<string>> = new Map();
const yDocConnections: Map<string, Y.Doc> = new Map();

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', async (currWs: WebSocket, req) => {
    // Parse the room id from the request URL
    const url = new URL((req.url || ''), 'http://localhost:8080');
    const roomId = url.searchParams.get('roomId') || '';
    const userId = url.searchParams.get('userId') || '';

    const user = await User.readById(userId);

    // Add the WebSocket to the connections Map for the room
    if (!connections.has(roomId)) {
        connections.set(roomId, new Set());
        userConnections.set(roomId, new Set());

        // Create a Yjs document for the room
        const ydoc = new Y.Doc();

        // Create a Yjs awareness instance for the client
        const wsProvider = new WebsocketProvider(
            `ws://localhost:1234`, roomId,
            ydoc,
            { WebSocketPolyfill: ws as any }
        )
        yDocConnections.set(roomId, ydoc);
        ySocketConnections.set(roomId, wsProvider);

        const room = await Room.getByCode(roomId);
        if (room && room.ydoc) {
            const retrievedState = new Uint8Array(JSON.parse(room.ydoc)) // Convert string to Uint8Array
            Y.applyUpdate(ydoc, retrievedState)
        }


        // Send the Yjs updates to all connected clients in the room
        wsProvider.on('update', (update: Uint8Array, origin: any) => {
            connections.get(roomId)?.forEach((client) => {
                if (client !== currWs) {
                    client.send(update);
                }
            });
        });

        wsProvider.on('status', (event: any) => {
            console.log(roomId, event.status); // logs "connected" or "disconnected"
        });
    }
    connections.get(roomId)?.add(currWs);
    userConnections.get(roomId)?.add(userId);
    broadcastClientCount(roomId);

    if (userConnections.get(roomId)?.size) {

        if (user) {
            const joinMessage = JSON.stringify({
                type: 'user-joined',
                payload: {
                    userId,
                    name: user.username,
                }
            });

            broadcastToRoom(roomId, joinMessage);
        }
    }
    // Listen for WebSocket messages
    // currWs.on('message', (message: string) => {
    //     console.log(`Received message: ${message}`);
    // });

    // Listen for WebSocket disconnections
    currWs.on('close', () => {
        if (user) {
            const leaveMessage = JSON.stringify({
                type: 'user-leaved',
                payload: {
                    userId,
                    name: user.username,
                }
            });
            broadcastToRoom(roomId, leaveMessage);
        }


        connections.get(roomId)?.delete(currWs);
        userConnections.get(roomId)?.delete(userId);
        broadcastClientCount(roomId);

        if (!connections.get(roomId)?.size) {
            saveYDocToMySQL(roomId);
            yDocConnections.delete(roomId);
            ySocketConnections.get(roomId)?.awareness.destroy();
            ySocketConnections.get(roomId)?.destroy();
        }
    });
});

// Only generate a token for lower level environments
if (process.env.NODE_ENV !== 'production') {
    console.log('JWT', generateLocalToken());
}

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
    throw reason;
});

process.on('uncaughtException', (error: Error) => {
    errorHandler.handleError(error);
    if (!errorHandler.isTrustedError(error)) {
        process.exit(1);
    }
});

function broadcastClientCount(roomId: string) {
    const clientsCount = userConnections.get(roomId)?.size;
    const clientsCountMessage = JSON.stringify({
        type: 'room-clients',
        payload: {
            clientsCount,
        }
    });
    broadcastToRoom(roomId, clientsCountMessage);
}

function broadcastToRoom(roomId: string, message: string) {
    const wsSet = connections.get(roomId)?.values();
    if (wsSet) {
        for (const wsItem of wsSet) {
            wsItem.send(message);
        }
    };
}

// Function to save yDoc to MySQL
async function saveYDocToMySQL(roomId: string) {
    try {
        const yDoc = yDocConnections.get(roomId);

        if (yDoc) {
            const yDocString = Y.encodeStateAsUpdate(yDoc);
            const stringifiedYDoc = JSON.stringify(Array.from(yDocString)) // Convert Uint8Array to string

            const room = await Room.saveYDocByCode(roomId, stringifiedYDoc);
            console.log(`YDoc saved to MySQL with ID ${room.id}`);
        }
    } catch (err) {
        console.error(`Error saving YDoc to MySQL: ${err}`);
    }
}
