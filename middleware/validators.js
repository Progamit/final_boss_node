const jwt = require("jsonwebtoken");
module.exports = {
    validation: (req,res,next) => {
        const info = req.body
        let hasUpperCaseLetter = false;
        if (info.username.length > 20) return  res.send({ error: true, data: [], message: "login error" });
        if (info.username.length < 4) return res.send({ error: true, data: [], message: "login error" });
        if (info.password.length > 20) return res.send({ error: true, data: [], message: "login error" });
        if (info.password.length < 4) return res.send({ error: true, data: [], message: "login error" });
        hasUpperCaseLetter = /[A-Z]/.test(info.password);
        if (!hasUpperCaseLetter) return res.send({ error: true, data: [], message: "false" });
        next()
    },

    authorization : (req, res, next) => {
        if (!req.headers.authorization) return;
        const token = req.headers.authorization;
        jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
            if (err) {
                return res.send({ error: true, data: [], message: "false" });
            }
            req.user = data;
            next();
        });
    }}