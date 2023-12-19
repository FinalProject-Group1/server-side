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
    orderStatus: {
      type: DataTypes.STRING,
      defaultValue: "progress"
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: "unpaid"
    },
    transactionToken: {
      type: DataTypes.STRING
    },
    OrderId: {
      type: DataTypes.STRING
    },
    expiredTransaction: {
      type: DataTypes.DATE
    },
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};