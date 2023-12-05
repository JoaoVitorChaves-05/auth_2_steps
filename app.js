import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import path from 'path'
import authRoutes from './src/routes/auth.routes.js'
import homeRoutes from './src/routes/home.routes.js'

class App {
    constructor() {
        this.app = express()
        this.app.use(express.static('./src/public'))
        this.app.set('view engine', 'ejs')
        this.app.set('views', './src/views')
        this.middlewares()
        this.routes()
    }

    middlewares() {
        this.app.use(cookieParser())
        this.app.use(express.urlencoded({ extended: false }))
        this.app.use(express.json())
    }

    routes() {
        this.app.get('/', (req, res) => res.redirect('/home'))
        this.app.use('/home', homeRoutes)
        this.app.use('/auth', authRoutes)
    }
}

export default new App().app