const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');
async function authentication(req, res, next) {
  try {
    if (!req.headers.authorization) throw { name: 'Unauthenticated' };
    let access_token = req.headers.authorization.replace('Bearer ', '');
    let verifyTok = verifyToken(access_token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (verifyTok.exp && verifyTok.exp < currentTime) {
      throw { name: 'Unauthenticated' };
    }
    let user = await User.findByPk(verifyTok.id);
    // console.log(user, "<< ini usernya")
    if (!user) throw { name: 'Unauthenticated' };
    req.user = user;
    next();
  } catch (error) {
  
    next(error);
  }
}

module.exports = authentication;
