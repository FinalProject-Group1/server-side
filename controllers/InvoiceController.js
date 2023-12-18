const{Invoice, OrderItem} = require('../models')
class InvoiceController{
 static async getInvoice(req, res, next){
    try {
        const {id} = req.params
        const invoice = await Invoice.findByPk(id, {
            include: {
                model: OrderItem,
                include: {
                    association: 'sellerproduct'
                }
            }
        })

        res.status(200).json(invoice)
    } catch (error) {
        console.log(error, "<< ini errornya")
        next(error)
    }
 }
}

module.exports = InvoiceController