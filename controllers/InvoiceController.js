const{Invoice, OrderItem, sequelize, SellerProduct, User} = require('../models');
const { Op } = require("sequelize");
class InvoiceController{
 static async getInvoice(req, res, next){
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
      
      next(error);
    }
  }

  static async createInvoice(req, res, next) {
    const t = await sequelize.transaction();
    try {
        const { SellerId, products } = req.body
        const BuyerId = req.user.id
        if(BuyerId === SellerId) throw({name: "SameShop"})
        const user = await User.findByPk(+SellerId)
    // console.log(buyer)
        if(user.role !== 'seller') throw ({name: "NotSeller"})
        const sellerProducts = await SellerProduct.findAll({where: {
            [Op.or]: [
               ...products.map((el) => ({id : el.SellerProductId}))
              ]
        },
        include : {
            association: 'product'
        }
    })

        const errors = []
        sellerProducts.forEach((el) => {
           
           const sellerProduct = products.find(product => product.SellerProductId == el.id)
        //   console.log(el)
      
            if(el.stock < sellerProduct.quantity) {
                errors.push(`Stock ${el.product.productName} tidak mencukupi`)
            }
        })
        if(errors.length > 0) throw({name: "StockKurang", message: errors})
        


       
      const createINV = await Invoice.create({SellerId: +SellerId, BuyerId}, { transaction: t })
      const newProducts = products.map((el) => {
            const obj = {
                ...el,
                InvoiceId : createINV.id
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
