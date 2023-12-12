import express from 'express'
import { authorize } from '../middleware/authenticate'
import { validation } from '../middleware/validation'
import * as verificationController from '../controllers/verificationController'

export const verificationRouter = express.Router()

verificationRouter.post('/', authorize, validation(['code']), verificationController.verifyUser)

verificationRouter.get('/', authorize, verificationController.resendVerificationToken)