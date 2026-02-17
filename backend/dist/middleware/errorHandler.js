"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    // Log error (should use a proper logger like pino/winston in production)
    console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
    if (err.stack && env_1.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(err instanceof errors_1.ValidationError && { errors: err.errors }),
        });
    }
    // Default to 500
    const message = env_1.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
    res.status(500).json({
        status: 'error',
        message,
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
