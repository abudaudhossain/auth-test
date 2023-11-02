const express = require("express");
require('dotenv').config();
const app = express();
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./authMiddleware");

const port = process.env.PORT || 8000;

app.use(cookieParser())
app.use(express.json())

const users = [
    {
        id: 1,
        email: "email@gmail.com",
        name: "name1",
        password: "1234"
    },
    {
        id: 2,
        email: "email2@gmail.com",
        name: "name2",
        password: "1234"
    },
    {
        id: 3,
        email: "email3@gmail.com",
        name: "name3",
        password: "1234"
    },
    {
        id: 4,
        email: "email4@gmail.com",
        name: "name4",
        password: "1234"
    },


]

app.get("/", async (req, res) => {
    res.send("hello word")
})
app.post('/login', async (req, res) => {
    try {

        console.log('Cookies: ', req.cookies)
        const { email, password } = req.body
        // find user by email
        const user = users.find(user => user.email === email)
        console.log('user: ', user)
        if (!user) throw new Error("user not found")

        if (user.password !== password) throw new Error("Wrong Credential")
        const accessToken_secret = process.env.JWT_SECRET_ACCESS_TOKEN;
        const refreshToken_secret = process.env.JWT_SECRET_REFRESH_TOKEN;
        console.log("accessToken_secret: ", accessToken_secret)
        console.log("refreshToken_secret: ", refreshToken_secret)

        const accessToken = jwt.sign(user, accessToken_secret, { expiresIn: '2m' })
        const refreshToken = jwt.sign(user, refreshToken_secret, { expiresIn: '2day' })


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
        });

        res.status(200).json({
            user: user,
            tokens: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }

        })
    } catch (error) {
        console.log(error);

        return res.status(406).json({
            message: error.message
        })
    }
})

app.get('/users', authMiddleware, async (req, res) => {
    try {

        res.json(users)
    } catch (error) {

    }
})

app.get('/refresh-token', async (req, res) => {
    try {


        const { refreshToken } = req.cookies;
        console.log(req.cookies)


        const accessToken_secret = process.env.JWT_SECRET_ACCESS_TOKEN;
        const refreshToken_secret = process.env.JWT_SECRET_REFRESH_TOKEN;

        let decoded = jwt.verify(refreshToken, refreshToken_secret)
        const user = users.find(user => user.email === decoded.email)
        console.log("user: ", user)
        console.log("accessToken_secret: ", accessToken_secret)
        console.log("refreshToken_secret: ", refreshToken_secret)

        const accessToken = jwt.sign(user, accessToken_secret, { expiresIn: '2m' })
        const newRefreshToken = jwt.sign(user, refreshToken_secret, { expiresIn: '2day' })


        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            user: user,
            tokens: {
                accessToken: accessToken,
                refreshToken: newRefreshToken
            }

        })

    } catch (error) {
        console.log(error);

        res.status(401).json({
            message: "invalid token"
        })
    }
})
app.listen(port, () => {
    console.log(`Auth app listening on port ${port}`)
})


