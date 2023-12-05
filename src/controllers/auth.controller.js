import AuthModel from "../models/auth.model.js"
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

class AuthController {
    constructor() {
        this.loginToVerify = []
        this.transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })
        this.tryLogin = this.tryLogin.bind(this)
        this.renderVerifyLogin = this.renderVerifyLogin.bind(this)
        this.tryVerify = this.tryVerify.bind(this)
    }

    renderLogin(req, res) {
        const message = req.query.message || null

        return res.status(200).render('login', { message })
    }

    renderRegister(req, res) {
        const message = req.query.message || null

        return res.status(200).render('register', { message })
    }

    renderVerifyLogin(req, res) {
        const { email } = req.params
        const message = req.query.message || null
        
        const verify = this.loginToVerify.find(el => el.email == email)

        console.log('Verify', verify)

        if (!verify) return res.status(401).render('verify', { message: 'Email not found', ok: false })

        res.status(200).render('verify', { message })
    }

    async renderHome(req, res) {
        const user = await AuthModel.checkUser({token: req.cookies.token})
        res.status(200).render('success', { name: user.name })
    }

    async tryLogin(req, res) {
        const { email, password } = req.body

        if (!email)
            return res.status(400).redirect(`/auth/login?message=${new URLSearchParams('The email address is missing or is not valid')}`)
        if (!password)
            return res.status(400).redirect(`/auth/login?message=${new URLSearchParams('The password is missing or is not valid')}`)

        const result = await AuthModel.login({ email, password })

        if (result) {
            if (result.ok) {

                res.cookie('token', result.token, { maxAge: 1548000 * 1000})
                res.cookie('verified', result.verified, { maxAge: 1548000 * 1000 })

                const key = await AuthModel.generateKey()

                this.loginToVerify.push({email: result.user.email, key: key})
                console.log(this.loginToVerify)
                this.transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: 'Code to verify login',
                    text: `Your code: ${key.join(' ')}.`
                }, (err, info) => {
                    if (err)
                        return console.log(err)
                    else
                        return console.log(info.response)
                })

                return res.status(200).redirect(`/auth/verify/${result.user.email}`)
            }
            return res.status(200).redirect(`/auth/login?message=${'Credentials not authorizeds'}`)
        }
        return res.status(400).redirect(`/auth/login?message=${'Ops! Something went wrong. Please, try again later.'}`)
    }

    async tryVerify(req, res) {
        const { key } = req.body
        if (!key)
            return res.status(400).redirect(`/auth/login?message=${'Key is missing. Please, login again.'}`)
 
        console.log('cookies', req.cookies)
        const user = await AuthModel.checkUser({token: req.cookies.token})
        const find = this.loginToVerify.find(el => el.key.join('') == key && el.email == user.email)

        if (!find)
            return res.status(200).redirect(`/auth/login?message=${'Key not found'}`)

        this.loginToVerify = this.loginToVerify.map(el => el.key != key && el.email != user.email)
        req.cookies.verified = jwt.sign({ verified: true}, process.env.SECRET_KEY, { expiresIn: 5184000 })

        return res.status(200).redirect('/auth/home')
    }

    async tryRegister(req, res) {
        const { name, email, password} = req.body

        if (!name)
            return res.status(400).redirect(`/auth/register?message=${'The name is missing or is not valid'}`)

        if (!email)
            return res.status(400).redirect(`/auth/register?message=${'The email is missing or is not valid'}`)

        if (!password)
            return res.status(400).redirect(`/auth/register?message=${'The password is missing or is not valid'}`)

        const result = await AuthModel.createUser({name, email, password})

        console.log('result', result)
        if (result) {
            if (result.ok) {
                return res.status(200).redirect('/auth/login')
            }
            return res.status(400).redirect(`/auth/register?message=${result.message}`)
        }

        return res.status(400).redirect(`/auth/register?message=${'Ops! Something went wrong. Please try again later'}`)

    }

    async logout(req, res) {
        res.clearCookie('token')
        res.clearCookie('verified')
        return res.redirect('/home')
    }

}

export default new AuthController()