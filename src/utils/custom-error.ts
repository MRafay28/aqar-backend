class CustomError extends Error {
    statusCode: number;
    code?: string;
    data?: unknown;

    constructor(message: string, statusCode: number, code?: string, data?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;
