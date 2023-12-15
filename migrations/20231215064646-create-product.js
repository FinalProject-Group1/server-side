'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productName: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      priceCompare: {
        type: Sequelize.INTEGER
      },
      changed: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      imageUrl: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      unit: {
        type: Sequelize.STRING
      },
      risePercentage: {
        type: Sequelize.STRING
      },
      riseDuration: {
        type: Sequelize.INTEGER
      },
      decreasePercentage: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};