const { Product } = require('../models')
class ProductController {

    static async getProducts(req, res, next){
       try {
        const products = await Product.findAll()
        
        res.status(200).json(products)

       } catch (error) {
          next(error)
       }
    }

    

}

module.exports = ProductController