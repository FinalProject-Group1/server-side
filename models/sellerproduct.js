'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SellerProduct extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SellerProduct.belongsTo(models.User, {foreignKey: 'SellerId', as: 'seller'})
      SellerProduct.belongsTo(models.Product, {foreignKey: 'ProductId', as: 'product'})
    }
  }
  SellerProduct.init({
    ProductId: DataTypes.INTEGER,
    SellerId: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SellerProduct',
  });
  return SellerProduct;
};