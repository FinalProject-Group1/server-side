const midtransClient = require('midtrans-client');
const {Invoice, OrderItem} = require('../models');
const {nanoid} = require('nanoid')
class PaymentGate {

    static async getMidtransToken (req, res, next){
      
      try {
        const {InvoiceId} = req.body
        const invoice = await Invoice.findByPk(InvoiceId, {
          include: {
              model: OrderItem,
              include: {
                  association: 'sellerproduct'
              }
          }
      })
      if(!invoice) throw ({name: 'NotFound'})
        // console.log(invoice.OrderItems, "<< ini invoice order item")
        let result = 0;
        invoice.OrderItems.forEach((el) => {
          result += (el.sellerproduct.price*el.quantity)
        });
        
        // console.log(invoice, "<< ini invoice sellerproduct")
        let snap = new midtransClient.Snap({
            isProduction : false,
            serverKey : process.env.MIDTRANS_KEY
        });

        const orderId = `trx-${invoice.id}-${nanoid()}`;
        // console.log(req.user)
        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": result
            },
            "credit_card":{
                "secure" : true
            },
            "customer_details": {
                "first_name": req.user.fullname,
                "phone": req.user.phoneNumber,
                "address": req.user.address,
                "billing_address": {
                  "address": req.user.address
                },
                "shipping_address": {
                  "address": req.user.address
                },
            },
            
        };
        
        const transaction = await snap.createTransaction(parameter)
        console.log(transaction)
        res.json({transaction_token: transaction.token, orderId})
      } catch (error) {
        console.log(error, "<< ini errornya")
        next(error)
      }  
    }
    static async success (req, res, next){
      try {
        console.log(req.body, "<< isi bodynya")
          res.status(200).json('oke')
      } catch (error) {
        console.log(error, "<< ini errornya")
        next(error)
      }

    }

}

module.exports = PaymentGate;