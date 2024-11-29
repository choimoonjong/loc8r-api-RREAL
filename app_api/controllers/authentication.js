const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: "All fields required" });
    }

    try {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.setPassword(req.body.password);

        await user.save(); // 비동기 저장
        const token = user.generateJwt();
        res.status(200).json({ token });
    } catch (err) {
        res.status(404).json(err);
    }
};

const login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ message: "All fields required" });
    }

    try {
        const user = await new Promise((resolve, reject) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    return reject(err); // 인증 과정에서 에러 발생
                }
                if (!user) {
                    return reject(info); // 사용자 인증 실패
                }
                resolve(user); // 인증 성공
            })(req, res);
        });

        const token = user.generateJwt(); // JWT 토큰 생성
        res.status(200).json({ token }); // 성공 응답
    } catch (err) {
        res.status(401).json(err); // 인증 실패 또는 에러 반환
    }
};

module.exports = {
    register,
    login
};

