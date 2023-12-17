const {verifyToken} = require('../helpers/jwt');
const {User} = require('../models');
async function  authentication(req, res, next){
    try {
        if(!req.headers.authorization) throw {name: "Unauthenticated"};
        let access_token = req.headers.authorization.replace("Bearer ", "");
        let {id} = verifyToken(access_token);
        let user = await User.findByPk(id);
        // console.log(user, "<< ini usernya")
        if(!user) throw {name: "Unauthenticated"};
        req.user = user
      next();
    } catch (error) {
      next(error);
    }
};

module.exports = authentication; 