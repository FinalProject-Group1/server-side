'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invoice.hasMany(models.OrderItem, {foreignKey: 'InvoiceId'})
      Invoice.belongsTo(models.User, {foreignKey: 'SellerId', as : "seller"})
      Invoice.belongsTo(models.User, {foreignKey: 'BuyerId', as : 'buyer'})
    }
  }
  Invoice.init({
    SellerId: DataTypes.INTEGER,
    BuyerId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    orderStatus: DataTypes.STRING,
    paymentStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};