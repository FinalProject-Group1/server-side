const { Invoice, OrderItem, sequelize, SellerProduct, User } = require('../models');
const { Op } = require("sequelize");
const { Whatsapp } = require('./whatsapp');
class InvoiceController {
  static async getInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id, {
        include: [{
          model: OrderItem,
          include: {
            association: 'sellerproduct',
            include: {
              association: 'product'
            }
          }
          },
          {
            include: {
              association: 'buyer'
            }
          }
        ],
      });

      res.status(200).json(invoice);
    } catch (error) {

      next(error);
    }
  }

  static async createInvoice(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { SellerId, products } = req.body
      const BuyerId = req.user.id
      if (BuyerId === SellerId) throw ({ name: "SameShop" })
      const user = await User.findByPk(+SellerId)
      // console.log(buyer)
      if (user.role !== 'seller') throw ({ name: "NotSeller" })
      const sellerProducts = await SellerProduct.findAll({
        where: {
          [Op.or]: [
            ...products.map((el) => ({ id: el.SellerProductId }))
          ]
        },
        include: {
          association: 'product'
        }
      })

      const errors = []
      sellerProducts.forEach((el) => {

        const sellerProduct = products.find(product => product.SellerProductId == el.id)
        //   console.log(el)

        if (el.stock < sellerProduct.quantity) {
          errors.push(`Stock ${el.product.productName} tidak mencukupi`)
        }
      })
      if (errors.length > 0) throw ({ name: "StockKurang", message: errors })




      const createINV = await Invoice.create({ SellerId: +SellerId, BuyerId }, { transaction: t })
      const newProducts = products.map((el) => {
        const obj = {
          ...el,
          InvoiceId: createINV.id
        }
        return obj
      })
      // console.log(newProducts)
      const createOrder = await OrderItem.bulkCreate(newProducts, { transaction: t })
      await t.commit();

      res.status(201).json(createOrder)
    } catch (error) {
      await t.rollback();
      // console.log(error)
      next(error)
    }
  }

  static async editInvoiceBuyer(req, res, next) {
    const rupiah = (number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      }).format(number);
    }
    const t = await sequelize.transaction();
    try {
      const { SellerId, InvoiceId } = req.body
      const BuyerId = req.user.id
      const invoice = await Invoice.findOne({
        include: {
          association: 'seller'
        },
        where: {
          [Op.and]: [
            { SellerId: +SellerId },
            { BuyerId },
            { id: +InvoiceId }
          ]
        }
      });

      if (!invoice) throw { name: 'NotFound' };
      if(invoice.orderStatus === 'done') throw ({name: "OnDone"})
      if(invoice.orderStatus !== 'shipment') throw ({name: "OnShipping"})

      await invoice.update({ orderStatus: 'done' }, {transaction: t});
      const amount = invoice.pendingAmount
      const temp = ((+amount) - 9000)
  


      if (!invoice.seller.saldo) {
        await invoice.seller.update({ saldo: temp }, {transaction: t})

      } else {
        await invoice.seller.update({ saldo: (invoice.seller.saldo + temp)}, {transaction: t})
      }
      



      await invoice.update({ pendingAmount: 0 }, {transaction: t})
      await t.commit();
      const message = `Notifikasi Order Selesai

Orderan dengan
id : ${invoice.OrderId}
Telah selesai
      
Dana Sebesar ${rupiah(temp)} telah masuk ke dalam rekeningmu`
      Whatsapp.sendMessage(invoice.seller.phoneNumber, message)

      res.status(200).json({ message: 'Orderan Diselesaikan' });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async editInvoiceSeller(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { BuyerId, InvoiceId } = req.body
      const SellerId = req.user.id;
      const invoice = await Invoice.findOne({
        include: [{
          association: 'seller'
        },
        {
          model: OrderItem,
          include: {
            association: 'sellerproduct',
            include: {
              association: 'product'
            }
          }
        }
      ],
        where: {
          [Op.and]: [
            { SellerId },
            { BuyerId: +BuyerId },
            { id: +InvoiceId }
          ],

        }
      });

      if (!invoice) throw { name: 'NotFound' };
      // console.log(invoice.OrderItems, "<< ini order items")
      if(invoice.orderStatus === 'shipment') throw ({name: "OnShipment"})
      const updatingStock = await Promise.all(invoice.OrderItems.map(async (el) => {
        if (el.SellerProductId === el.sellerproduct.id) {
          el.sellerproduct.stock = el.sellerproduct.stock - el.quantity;
      
          await SellerProduct.update(
            { stock: el.sellerproduct.stock },
            { where: { id: el.sellerproduct.id }},
            {transaction: t} 
          );
      
          
        }
        return el.sellerproduct.stock;
      }));
      if(!updatingStock) throw({name: "NotYet"})

      await invoice.update({ orderStatus: 'shipment' }, {transaction: t});
      
      await t.commit();

      const message = `Notifikasi Order Selesai

Orderan dengan
id : ${invoice.OrderId}
🚚 Status Pengiriman: Dalam Perjalanan
      
Pastikan apabila telah menerima paket maka untuk cek terlebih dahulu`
      Whatsapp.sendMessage(invoice.buyer.phoneNumber, message)

      res.status(200).json({ message: 'Orderan dalam pengiriman' });
    } catch (error) {
      // console.log(error, "<< ini error")
      await t.rollback();
      next(error);
    }
  }



}

module.exports = InvoiceController;
