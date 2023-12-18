const { Invoice, OrderItem, sequelize, SellerProduct } = require('../models');
const { Op } = require('sequelize');
class InvoiceController {
  static async getInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id, {
        include: {
          model: OrderItem,
          include: {
            association: 'sellerproduct',
          },
        },
      });

      res.status(200).json(invoice);
    } catch (error) {
      console.log(error, '<< ini errornya');
      next(error);
    }
  }

  static async createInvoice(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { SellerId, products } = req.body;
      const BuyerId = req.user.id;

      const sellerProducts = await SellerProduct.findAll({
        where: {
          [Op.or]: [...products.map((el) => ({ id: el.SellerProductId }))],
        },
        include: {
          association: 'product',
        },
      });
      // console.log(sellerProducts)
      sellerProducts.forEach((el) => {
        // console.log(el)
        const sellerProduct = products.find((product) => product.SellerProductId == el.id);
        //    console.log(sellerProduct)
        if (el.stock < sellerProduct.quantity) throw { name: 'StockKurang', message: `Stock ${el.product.productName} tidak mencukupi` };
      });
      // console.log([
      //     ...products.map((el) => ({SellerProductId : el.SellerProductId}))
      //    ])
      //   for(let i = 0; i < products.length; i++){
      //     const b = await SellerProduct.findAll(products[i].SellerProductId)
      //     if(b.stock < products[i].quantity) {
      //         a = false
      //     }
      //   }

      // const a = await OrderItem.findAll({
      //     include: {
      //         association: 'sellerproduct'
      //     },
      //     where : {

      //     }
      // })

      // console.log(a, "<<")
      //   const createINV = await Invoice.create({SellerId: +SellerId, BuyerId}, { transaction: t })
      //   const newProducts = products.map((el) => {
      //         const obj = {
      //             ...el,
      //             InvoiceId : createINV.id
      //         }
      //         return obj
      //     })
      // console.log(newProducts)
      //    const createOrder = await OrderItem.bulkCreate(newProducts, { transaction: t })
      //    await t.commit();

      res.status(201).json(sellerProducts);
    } catch (error) {
      // await t.rollback();

      next(error);
    }
  }

  static async editInvoice(req, res, next) {
    const { orderStatus } = req.body;
    const { id } = req.params;
    try {
      const invoice = await Invoice.findByPk(id);

      if (!invoice) throw { name: 'NotFound' };

      await invoice.update({ orderStatus });

      res.status(200).json({ message: 'Update successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InvoiceController;
