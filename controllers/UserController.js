const { comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const { User } = require('../models')
class UserController {

    static async login(req, res, next) {
        try {
            const { phoneNumber, password } = req.body
            // console.log(phoneNumber)

            if (!phoneNumber) throw ({ name: "NullPhoneNumber" })
            if (!password) throw ({ name: "NullPassword" })

            const user = await User.findOne({ where: { phoneNumber } });
            if (!user) throw ({ name: 'ErrorPhoneorPassword' });

            const isValid = comparePassword(password, user.password)
            if (!isValid) throw ({ name: 'ErrorPhoneorPassword' });

            const token = signToken({
                id: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role
            })

            res.status(200).json({ access_token: token })
        } catch (error) {
            next(error)
        }

    }

    static async getUserId(req, res, next) {
        try {
            const { id } = req.params
            
            const user = await User.findByPk(id, {
                include: {
                    association: 'products',
                    include: {
                        association: 'product'
                    }
                }
            })
    
            // const user = await User.findByPk(id, {
            //     include: {
            //         association: 'products'
            //     }
            // })
            
            res.status(200).json(user)
        } catch (error) {
            
            next(error)
        }
    }

}

module.exports = UserController;