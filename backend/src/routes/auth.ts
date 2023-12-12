import express from "express";
import { validation } from "../middleware/validation";
import { rateLimiter } from "../middleware/rateLimiter";
import * as authController from "../controllers/authController";

export const authRouter = express.Router();

authRouter.post('/availability', authController.checkAvailability)
authRouter.post('/signup', validation(['username', 'password', 'confirmPassword', 'email']), authController.signupUser)
authRouter.post('/login', rateLimiter('login', 5, 300), validation(['email', 'password']), authController.loginUser)
authRouter.delete('/logout', authController.logoutUser)