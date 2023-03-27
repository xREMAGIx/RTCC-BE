import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { APIError, errorHandler } from "./middleware/errorHandler";
import { loggerMiddleware } from "./middleware/logger";
import routes from "./routes";
import { generateToken } from "./utils/jwt";

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

// Only generate a token for lower level environments
if (process.env.NODE_ENV !== 'production') {
    console.log('JWT', generateToken());
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