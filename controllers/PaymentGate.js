const midtransClient = require('midtrans-client');
const {nanoid} = require('nanoid')
class PaymentGate {

    static async getMidtransToken (req, res, next){
      try {
        let snap = new midtransClient.Snap({
            isProduction : false,
            serverKey : process.env.MIDTRANS_KEY
        });

        const orderId = `trx-id-${nanoid()}`;

        // console.log(req.user)
        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": 39000
            },
            "credit_card":{
                "secure" : true
            },
            "customer_details": {
                "fullname": req.user.fullname,
                "phone": req.user.phoneNumber,
                "address": req.user.address
            }
        };

        const transaction = await snap.createTransaction(parameter)
   
        res.json({transaction_token: transaction.token, orderId})
      } catch (error) {
        next(error)
      }  
    }


}

module.exports = PaymentGate;