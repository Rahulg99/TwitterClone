const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY, JWT_TOKEN_EXPIRATION_TIME } = require('./constants');

const generateJWTWebTokenPayload = (user) => {
    return jwt.sign(user, JWT_SECRET_KEY, {
        expiresIn: JWT_TOKEN_EXPIRATION_TIME
    })
};

const verifyJWTToken = token => {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY);
        return decodedToken;
    } catch (error) {
        console.log('message ',error);
        throw new Error(error.message);
    }
}

module.exports = {generateJWTWebTokenPayload, verifyJWTToken}