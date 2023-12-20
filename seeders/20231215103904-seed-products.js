'use strict';

const { default: axios } = require('axios');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // const { data } = await axios.get('https://infopangan.jakarta.go.id/api/price/lists');

    // const api = data.data.prices;
    // const products = api.map((el) => {
    //   const obj = {
    //     productName: el.name,
    //     unit: el.unit,
    //     price: el.price,
    //     priceCompare: el.price_compare,
    //     HER: (1.02 * el.price),
    //     HET: (1.03 * el.price),
    //     change: el.changed,
    //     status: el.status,
    //     risePercentage: el.rise_percentage,
    //     riseDuration: el.rise_duration,
    //     decreasePercentage: el.decrease_percentage,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   };

    //   return obj;
    // });
    const products = require('../products.json')
    products.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    })
    // console.log(products, "<< ini products")
    await queryInterface.bulkInsert('Products', products);
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.bulkDelete('Products', null, {
    //   truncate: true,
    //   restartIdentity: true
    // })
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
