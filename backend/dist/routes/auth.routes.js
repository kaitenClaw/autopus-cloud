"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        name: zod_1.z.string().optional(),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string(),
    }),
});
router.post('/signup', (0, validate_1.validate)(signupSchema), auth_controller_1.authController.signup);
router.post('/login', (0, validate_1.validate)(loginSchema), auth_controller_1.authController.login);
router.post('/google', auth_controller_1.authController.googleLogin);
router.post('/refresh', auth_controller_1.authController.refresh);
router.post('/logout', auth_controller_1.authController.logout);
exports.default = router;
