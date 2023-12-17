const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const signToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: 3600 });
};
const verifyToken = (token) => {
  return jwt.verify(token, secret, { ignoreExpiration: true });
};

module.exports = {
  signToken,
  verifyToken,
};
