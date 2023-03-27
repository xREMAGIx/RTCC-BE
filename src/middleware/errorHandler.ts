import { NextFunction, Request, Response } from 'express';

export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
}

class BaseError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;

    constructor(name: string, httpCode: HttpStatusCode, description: string, isOperational: boolean) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }
}

//free to extend the BaseError
class APIError extends BaseError {
    constructor(name: string, httpCode = HttpStatusCode.INTERNAL_SERVER, isOperational = true, description = 'internal server error') {
        super(name, httpCode, description, isOperational);
    }
}

class Api400Error extends BaseError {
    constructor(description = 'Bad request') {
        super('BAD_REQUEST', HttpStatusCode.BAD_REQUEST, description, true);
    }
}

class Api404Error extends BaseError {
    constructor(description = 'Not found') {
        super('NOT_FOUND', HttpStatusCode.NOT_FOUND, description, true);
    }
}

class Api500Error extends BaseError {
    constructor(description = 'Server error') {
        super('INTERNAL_SERVER', HttpStatusCode.INTERNAL_SERVER, description, true);
    }
}

class ErrorHandler {
    public async handleError(err: Error): Promise<void> {
        console.log(err);
    }

    public isTrustedError(error: Error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }

    public returnError(err: APIError, req: Request, res: Response, next: NextFunction) {
        res.status(err.httpCode || 500).send(err.message)
    }
}
export const errorHandler = new ErrorHandler();

export {
    APIError,
    Api400Error,
    Api404Error,
    Api500Error,
};
