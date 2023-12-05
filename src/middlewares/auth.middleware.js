import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

class AuthMiddleware {
    static isLogged(req, res, next) {

        if (!req.cookies.token)
            return res.status(400).redirect('/auth/login')

        if (!req.cookies.verified)
            return res.status(400).redirect('/auth/login')

        const token = jwt.verify(req.cookies.token, process.env.SECRET_KEY)
        const verified = jwt.verify(req.cookies.verified, process.env.SECRET_KEY)

        if (!verified || !token)
            return res.status(400).redirect('/auth/login')
        
        next()
    }
}

export default AuthMiddleware