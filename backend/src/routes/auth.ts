import express from "express";
import { validation } from "../middleware/validation";
import { rateLimiter } from "../middleware/rateLimiter";
import * as authController from "../controllers/authController";

export const authRouter = express.Router();
const validationMware = validation([{
    property: 'username',
    min: 3,
    max: 25,
    regex: /^\w+$/
}, {
    property: 'password',
    min: 6
}, {
    property: 'confirmPassword'
}, {
    property: 'email',
    regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/,
}])

authRouter.post('/availability', authController.checkAvailability)
authRouter.post('/signup', validationMware, authController.signupUser)
authRouter.post('/login', rateLimiter('login', 5, 300), validation(['email', 'password']), authController.loginUser)
authRouter.delete('/logout', authController.logoutUser)
