const { Product, SellerProduct } = require('../models')
class ProductController {

    static async getProducts(req, res, next){
       try {
        const products = await Product.findAll()
        
        res.status(200).json(products)

       } catch (error) {
          next(error)
       }
    }

    static async sellerAdd(req, res, next){
        try {
            const {ProductId, stock, price} = req.body
            // console.log(req.user, "<<<")
            const SellerId = req.user.id
            // console.log({ProductId, stock, price, SellerId})
            const create = await SellerProduct.create({ProductId: +ProductId, stock: +stock, price: +price, SellerId})

            res.status(201).json(create)
        } catch (error) {
            console.log(error, "<< ini error")
            next(error)
        }
    }

}

module.exports = ProductController