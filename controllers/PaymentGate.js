const midtransClient = require('midtrans-client');
const { Invoice, OrderItem, User } = require('../models');
const { nanoid } = require('nanoid');
const { Whatsapp } = require('./whatsapp');
class PaymentGate {

  static async getMidtransToken(req, res, next) {

    try {
      const { InvoiceId } = req.body
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
      if (!invoice) throw ({ name: 'NotFound' })
      // console.log(invoice.OrderItems, "<< ini invoice order item")
      let result = 0;
      let ongkir = 9000;
      invoice.OrderItems.forEach((el) => {
        result += (el.sellerproduct.price * el.quantity)

      });

      // console.log(invoice, "<< ini invoice sellerproduct")
      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_KEY
      });

      const orderId = `trx-${invoice.id}-${nanoid()}`;
      // console.log(req.user)
      let parameter = {
        "transaction_details": {
          "order_id": orderId,
          "gross_amount": result + ongkir
        },
        "credit_card": {
          "secure": true
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
          }),
          {
            "price": ongkir,
            "quantity": 1,
            "name": "ongkir",
          }
        ]

      };
      let currentTime = new Date();
      let expiredLink = currentTime.setDate(currentTime.getDate() + 1);
      let tomorrow = new Date(expiredLink) 

      await invoice.update({expiredTransaction: tomorrow});

      if (invoice.expiredTransaction < currentTime && invoice.orderStatus === 'progress') {
        await invoice.update({ orderStatus: "cancel" });
      }

      if (invoice.orderStatus === 'cancel') throw ({ name: 'Expired' });
      if (invoice.orderStatus === 'done') throw ({ name: 'OnDone' });

      if (!invoice.transactionToken) {
        const transaction = await snap.createTransaction(parameter);
        await invoice.update({ transactionToken: transaction.token, OrderId: orderId });

        res.json({ transaction_token: transaction.token, orderId });
        console.log(transaction)
      } else {
        res.json({ transaction_token: invoice.transactionToken, orderId: invoice.OrderId });
      }

    } catch (error) {
      console.log(error, "<< ini errornya")
      next(error)
    }
  }
  static async success(req, res, next) {
    const rupiah = (number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
      }).format(number);
    }
    const changeDate = (date) => {
      const data = new Date(date)
      const day = data.toLocaleString("ID", { day: '2-digit' })
      const month = data.toLocaleString("ID", { month: 'long' })
      const year = data.toLocaleString("ID", { year: 'numeric' })

      const format = `${day} ${month} ${year}`

      return format
    }
    try {
      // console.log(req.body, "<< isi bodynya")
      const { transaction_status, gross_amount, status_code, order_id, expiry_time, transaction_time } = req.body
      const stat = order_id.split('-')[1]
      // console.log(pk)

      const invoice = await Invoice.findByPk(+stat, {
        include: [
          {
            association: 'buyer'
          },
          {
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
        ]
      })


      // console.log(invoice.OrderItems, "<<< data invoice")

      const daftarBelanja = invoice.OrderItems.map((el, index) => {
        return `${index + 1}. ${el.sellerproduct.product.productName}
        - Jumlah: ${el.quantity} ${el.sellerproduct.product.unit}
        - Harga Satuan: ${rupiah(el.sellerproduct.price)}
        - Subtotal:  ${rupiah(el.quantity*el.sellerproduct.price)}
          `;
      });
      
      
      const listProduk = daftarBelanja.join('\r\n');
      if (transaction_status === 'capture') {
        await invoice.update({ paymentStatus: 'paid', pendingAmount: +gross_amount, timeTransaction: transaction_time })
        const message = `*Notifikasi Order Baru*

Order ID: ${order_id}
Tanggal Order: ${changeDate(transaction_time)}
      
👤 Pelanggan:
         
Nama: ${invoice.buyer.fullname}
Alamat: ${invoice.buyer.address}
Telepon: ${invoice.buyer.phoneNumber}
      
📦 Daftar Barang:
         
${listProduk}
Ongkos Kirim: ${rupiah(9000)}
      
💲 Total Harga: ${rupiah(+gross_amount)}
      
💳 Metode Pembayaran: Transfer Bank
      
💰 Status Pembayaran: Sudah Dibayar
      
🚚 Status Pengiriman: Belum Dikirim

klik link di bawah ini untuk mengubah status orderanmu
         |  |  |
        V V V

${process.env.BASE_URL_CLIENT}/transaction/${invoice.id}?token=${invoice.seller.token}`

       await Whatsapp.sendMessage(invoice.seller.phoneNumber, message)

        res.status(+status_code).json('Payment Succesfull')
      } else if (transaction_status === 'pending') {
        await invoice.update({ expiredTransaction: expiry_time })

        res.status(+status_code).json('Payment Pending')
      }
    } catch (error) {
      // console.log(error, "<< ini errornya")
      next(error)
    }

  }

}

module.exports = PaymentGate;