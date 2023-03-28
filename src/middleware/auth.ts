import { NextFunction, Request, Response } from 'express';
import { TokenPayloadParams, validateToken } from "utils/jwt";
import { Api401Error, Api500Error } from './errorHandler';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let jwt = req.headers.authorization;

        // verify request has token
        if (!jwt) {
            next(new Api401Error(`Authorization failed. Token not found.`));
            return;
        }

        // remove Bearer if using Bearer Authorization mechanism
        if (jwt.toLowerCase().startsWith('bearer')) {
            jwt = jwt.slice('bearer'.length).trim();
        }

        // verify token hasn't expired yet
        const decodedToken = await validateToken(jwt);

        // Attach the user ID to the request object for future use
        req.body.userId = (decodedToken as TokenPayloadParams).id;
        // Call the next middleware function in the chain
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            next(new Api401Error(`Authorization failed. Token invalid.`));
        } else {
            next(new Api500Error(error.message));
        }
        return;
    }
};
