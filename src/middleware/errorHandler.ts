import { NextFunction, Request, Response } from 'express';

export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER = 500,
}

class BaseError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;
    public readonly code: string;
    public readonly field: string;

    constructor(name: string, httpCode: HttpStatusCode, description: string, isOperational: boolean, code: string, field: string) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        this.code = code;
        this.field = field;

        Error.captureStackTrace(this);
    }
}

//free to extend the BaseError
class APIError extends BaseError {
    constructor(name: string, httpCode = HttpStatusCode.INTERNAL_SERVER, isOperational = true, description = 'internal server error', code = '', field = '') {
        super(name, httpCode, description, isOperational, code, field);
    }
}

class Api400Error extends BaseError {
    constructor(description = 'Bad request', code = 'bad_request', field = '') {
        super('BAD_REQUEST', HttpStatusCode.BAD_REQUEST, description, true, code, field);
    }
}

class Api401Error extends BaseError {
    constructor(description = 'Unauthorized', code = 'unauthorized ', field = '') {
        super('UNAUTHORIZED', HttpStatusCode.UNAUTHORIZED, description, true, code, field);
    }
}

class Api404Error extends BaseError {
    constructor(description = 'Not found', code = 'not_found', field = '') {
        super('NOT_FOUND', HttpStatusCode.NOT_FOUND, description, true, code, field);
    }
}

class Api409Error extends BaseError {
    constructor(description = 'Conflict', code = 'conflict', field = '') {
        super('CONFLICT', HttpStatusCode.CONFLICT, description, true, code, field);
    }
}

class Api500Error extends BaseError {
    constructor(description = 'Server error', code = 'server_error', field = '') {
        super('INTERNAL_SERVER', HttpStatusCode.INTERNAL_SERVER, description, true, code, field);
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
        res.status(err.httpCode || 500).send({
            code: err.code,
            field: err.field,
            message: err.message,
        })
    }
}
export const errorHandler = new ErrorHandler();

export {
    APIError,
    Api400Error,
    Api401Error,
    Api404Error,
    Api409Error,
    Api500Error,
};
