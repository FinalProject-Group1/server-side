'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Invoice, {foreignKey: "InvoiceId"})
      OrderItem.belongsTo(models.SellerProduct, {foreignKey: "SellerProductId", as: 'sellerproduct'})
      
    }
  }
  OrderItem.init({
    SellerProductId: DataTypes.INTEGER,
    InvoiceId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};