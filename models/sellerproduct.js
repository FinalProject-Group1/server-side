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
      SellerProduct.hasMany(models.OrderItem, {foreignKey: "SellerProductId", as: "sellerproduct"})
      SellerProduct.belongsTo(models.User, {foreignKey: 'SellerId', as: 'seller'})
      SellerProduct.belongsTo(models.Product, {foreignKey: 'ProductId', as: 'product'})
    }
  }
  SellerProduct.init({
    ProductId: DataTypes.INTEGER,
    SellerId: DataTypes.INTEGER,
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min : 0
      }
    },
    price: {
      type: DataTypes.INTEGER,
      validate: {
        min : 0,
        isValid(el, next){

          this.getProduct().then(product => {
            // Custom validation logic based on the Product's properties
            // console.log(product.price, "<<< ini apa")
            
            if (el < (product.price - 2000)) return next("Harga Terlalu Murah")
            if (el > (product.price + 2000)) return next("Harga Terlalu Mahal")
            
            next();
            
          });
        }

      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'inactive'
    }
  }, {
    sequelize,
    modelName: 'SellerProduct',
  });
  return SellerProduct;
};