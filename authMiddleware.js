const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        // console.log(req.headers);
        const accessToken = req.headers.authorization.split(" ")[1];
        const accessToken_secret = process.env.JWT_SECRET_ACCESS_TOKEN;
        console.log("accessToken_secret: ", accessToken_secret)
        let decoded = jwt.verify(accessToken, accessToken_secret)

        console.log("decoded: ", decoded)
        next();
    } catch (error) {
        console.log(error)
        res.status(406).json({
            message: error.message
        })
    }
}

module.exports = { authMiddleware }