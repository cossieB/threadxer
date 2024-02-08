import express from "express";
import * as refreshTokenController from '../controllers/refreshTokenController'

export const refreshRoutes = express.Router()

refreshRoutes.get('/', refreshTokenController.getAccessToken)