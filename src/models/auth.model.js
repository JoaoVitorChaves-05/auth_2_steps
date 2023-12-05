import database from '../database/database.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const { User } = database.models

class AuthModel {
    static async login({email, password}) {
        const user = await AuthModel.checkUser({email})

        if (!user) return { ok: false }

        const match = bcryptjs.compareSync(password, user.password_hash)

        if (!match) return { ok: false }

        const token = jwt.sign({user_id: user.user_id}, process.env.SECRET_KEY, { expiresIn: 5184000})
        const verified = jwt.sign({verified: false}, process.env.SECRET_KEY, { expiresIn: 5184000 })

        return { ok: true, token: token, user: user, verified: verified }
    }

    static async generateKey() {
        var numbers = []
        for (var i = 0; i < 6; i++) {
            numbers.push(Math.floor(Math.random() * 10))
        }
        return numbers
    }

    static async createUser({ name, email, password }) {
        const user = AuthModel.checkUser({email})

        if (!user) return { ok: false, message: 'This email already registered.' }

        const password_hash = bcryptjs.hashSync(password, 10)

        await User.create({name, email, password_hash})

        return { ok: true }
    }

    static async checkUser({email, token}) {

        if (email) {
            return await User.findOne({
                where: { email: email }
            }).then(res => {
                if (res) return res.toJSON()
                return res
            }).catch(err => console.log(err))
        }

        const result = jwt.verify(token, process.env.SECRET_KEY)

        return await User.findOne({
            where: { user_id: result.user_id }
        }).then(res => {
            if (res) return res.toJSON()
            return res
        }).catch(err => console.log(err))
    }

}

export default AuthModel