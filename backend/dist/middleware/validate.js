"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                }));
                next(new errors_1.ValidationError('Validation failed', errors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
