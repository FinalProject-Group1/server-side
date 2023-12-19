const midtransClient = require('midtrans-client');
const {Invoice, OrderItem, User} = require('../models');
const {nanoid} = require('nanoid')
class PaymentGate {

    static async getMidtransToken (req, res, next){
      
      try {
        const {InvoiceId} = req.body
        const invoice = await Invoice.findByPk(InvoiceId, {
          include: {
              model: OrderItem,
              include: {
                  association: 'sellerproduct',
                  include: {
                    association: 'product'
                  }
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

        const orderId = `trx-${invoice.id}-${nanoid()}$${invoice.SellerId}`;
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
          "item_details": [
            ...invoice.OrderItems.map((el) => {
             const obj = {
                "price": el.sellerproduct.price,
                "quantity": el.quantity,
                "name": el.sellerproduct.product.productName,
                "category": el.sellerproduct.product.category
              }
              return obj
            })
        ]
            
        };
        if(!invoice.transactionToken){
          const transaction = await snap.createTransaction(parameter)
          await invoice.update({transactionToken: transaction.token, OrderId: orderId})

          res.json({transaction_token: transaction.token, orderId})
          console.log(transaction)
        }else{
          res.json({transaction_token: invoice.transactionToken, orderId: invoice.OrderId})
        }
      } catch (error) {
        // console.log(error, "<< ini errornya")
        next(error)
      }  
    }
    static async success (req, res, next){
      try {
          console.log(req.body, "<< isi bodynya")
          const{transaction_status, gross_amount, status_code, order_id} = req.body
          const pk = order_id.split('$')[1]
          const stat = order_id.split('-')[1]
          // console.log(pk)
          if(transaction_status === 'capture'){
            const user = await User.findByPk(+pk)
            const invoice = await Invoice.findByPk(+stat)
            await invoice.update({paymentStatus: 'paid'})
            if(!user.saldo){
              await user.update({saldo: +gross_amount})
            }else{
              await user.update({saldo: (Number(gross_amount) + user.saldo)})
            }

            res.status(+status_code).json('Payment Succesfull')
          }else if(transaction_status === 'capture'){
            res.status(+status_code).json('Payment Pending')
          }
      } catch (error) {
        // console.log(error, "<< ini errornya")
        next(error)
      }

    }

}

module.exports = PaymentGate;