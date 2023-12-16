'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Product.hasMany(models.SellerProduct, {foreignKey: "ProductId", as: "product"})
      Product.belongsToMany(models.User, {through: "SellerProducts", as: "products", foreignKey: "ProductId"})
    }
  }
  Product.init({
    productName: DataTypes.STRING,
    price: DataTypes.INTEGER,
    priceCompare: DataTypes.INTEGER,
    changed: DataTypes.INTEGER,
    riseDuration: DataTypes.INTEGER,
    status: DataTypes.STRING, 
    risePercentage: DataTypes.STRING, 
    decreasePercentage: DataTypes.STRING, 
    unit: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};