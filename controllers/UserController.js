const { comparePassword } = require('../helpers/bcrypt');
const { signToken, verifyToken } = require('../helpers/jwt');
const { User, OrderItem } = require('../models');
class UserController {
  static async registerBuyer(req, res, next) {
    try {
      const { fullname, phoneNumber, address, password } = req.body;
      if (!fullname || !phoneNumber || !address || !password) throw { name: 'FieldMissing' };

      const buyer = await User.create({ fullname, phoneNumber, address, password, role: 'buyer' });

      res.status(201).json(buyer);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { phoneNumber, password } = req.body;
      // console.log(phoneNumber)

      if (!phoneNumber) throw { name: 'NullPhoneNumber' };
      if (!password) throw { name: 'NullPassword' };

      const user = await User.findOne({ where: { phoneNumber } });
      if (!user) throw { name: 'ErrorPhoneorPassword' };

      const isValid = comparePassword(password, user.password);
      if (!isValid) throw { name: 'ErrorPhoneorPassword' };

      let token = user.token;

      if (!token) {
        token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
        //update token di database
        await user.update({ token });
      }

      const verifyTok = verifyToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      //verifyToken
      if (verifyTok.exp && verifyTok.exp < currentTime) {
        token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
        //update token di database
        await user.update({ token });
      }

      res.status(200).json({ access_token: token });
    } catch (error) {
      next(error);
    }
  }

  static async getUserId(req, res, next) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: {
          association: 'products',
          include: {
            association: 'product',
          },
        },
      });

      // const user = await User.findByPk(id, {
      //     include: {
      //         association: 'products'
      //     }
      // })

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
  static async profile(req, res, next) {
    try {
        const phoneNumber = req.user.phoneNumber;
        const user = await User.findOne({
            attributes: [
                'id',
                'fullname',
                'phoneNumber',
                'address',
                'city',
                'role',
                'token',
                'shopName',
                'saldo',
            ],
            where: { phoneNumber },
        });

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

  static async sellerInvoice(req, res, next) {
    try {
      const id = req.user.id;
      const user = await User.findByPk(id, {
        attributes: ['shopName'],
        include: {
          association: 'seller',
          include: [{
            model: OrderItem,
            include: {
              association: 'sellerproduct',
              include: {
                association: 'product',
              },
            },
          },
          {
            association: 'buyer'
          }],
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.log(error, "<< ini errorna")
      next(error);
    }
  }

  static async buyerInvoice(req, res, next) {
    try {
      const id = req.user.id;
      const user = await User.findByPk(id, {
        include: {
          association: 'buyer',
          include: [{
            model: OrderItem,
            include: {
              association: 'sellerproduct',
              include: {
                association: 'product',
              },
            },
          },
          {
            association: 'seller'
          }],
        }
      });

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async mySellerProducts(req, res, next) {
    try {
      const id = req.user.id;

      const user = await User.findByPk(id, {
        include: {
          association: 'products',
          include: {
            association: 'product',
          },
        },
      });

      res.status(200).json(user);
    } catch (error) {
      console.log(error, "<< ini errornya")
      next(error);
    }
  }

}

module.exports = UserController;
