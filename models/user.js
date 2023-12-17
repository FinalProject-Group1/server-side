'use strict';
const {
  Model
} = require('sequelize');
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
      // User.belongsToMany(models.Product, {through: "SellerProducts", as: 'products', foreignKey: 'SellerId'})
    }
  }
  User.init({
    fullname: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    address: DataTypes.STRING,
    token: DataTypes.STRING,
    role: DataTypes.STRING,
    password: DataTypes.STRING,
    shopName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};