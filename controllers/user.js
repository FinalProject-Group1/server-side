const { User } = require('../models')
class UserController {

    static async login(req, res, next) {
        try {
            const {username, password} = req.body

            if(!username) throw ({name: "NullEmail"})
            if(!password) throw ({name: "NullPassword"})
            
            const user = await User.findOne({username});
            if(!user) throw ({name: 'ErrorEmailorPassword'});
            
            

        } catch (error) {
            next(error)
        }
        
    }

}

module.exports = User;