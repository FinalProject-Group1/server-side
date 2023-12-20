'use strict';
const {
  Model
} = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.SellerProduct, {foreignKey: 'SellerId', as: "products"})
      User.hasMany(models.Invoice, {foreignKey: "SellerId", as: "seller"})
      User.hasMany(models.Invoice, {foreignKey: "BuyerId", as: "buyer"})
      // User.belongsToMany(models.Product, {through: "SellerProducts", as: 'products', foreignKey: 'SellerId'})
    }
  }
  User.init({
    fullname: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    token: DataTypes.STRING,
    role: DataTypes.STRING,
    password: DataTypes.STRING,
    saldo: DataTypes.INTEGER,
    shopName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate((el) => {
    el.password = hashPassword(el.password)
  })

  
  return User;
};