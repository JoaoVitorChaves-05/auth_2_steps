import { Router } from "express"
import authController from "../controllers/auth.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
const router = new Router()

router.get('/login', authController.renderLogin)
router.get('/register', authController.renderRegister)
router.get('/verify/:email', authController.renderVerifyLogin)

router.post('/register', authController.tryRegister)
router.post('/login', authController.tryLogin)
router.post('/verify', authController.tryVerify)
router.post('/logout', authController.logout)

router.get('/home', authMiddleware.isLogged, authController.renderHome)

export default router