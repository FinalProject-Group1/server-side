const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const { User } = require('../models');

const client = new Client({
  authStrategy: new LocalAuth(),
});
const qrcode = require('qrcode-terminal');
const { hashPassword } = require('../helpers/bcrypt');
const messageFormat = require('../helpers/message');
const { signToken, verifyToken } = require('../helpers/jwt');

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Client is ready!');
});

function message() {
  client.on('message', async (msg) => {
    try {
      const phoneNum = msg.id.remote;
      const phoneNumberFormat = phoneNum.replace('@c.us', '');

      //Daftar sebagai seller
      if (msg.body == '1') {
        const Nama_toko = await msg.getContact();
        // const phoneNumber = msg.id.remote;
        const phoneNumber = msg.id.remote;
        console.log(Nama_toko.pushname, phoneNumber);

        //   number = number.includes('@c.us') ? number : `${number}@c.us`;
        //   console.log(number);
        client.sendMessage(
          msg.id.remote,
          `Untuk melakukan register anda harus membuat password untuk akun anda
Caranya dengan mengirim pesan 'password: <password anda>'
              
Contoh: 
password: petanisejahtera`
        );
        return;
      } else if (msg.body.startsWith('password:')) {
        // Masukkan password dan masukkan data user ke database

        const password = msg.body.split(' ')[1];
        // pengecekan accountya udah terdaftar atau belum
        const user = await User.findOne({ where: { phoneNumber: phoneNumberFormat } });

        // ketika akunnya terdaftar bot mengirim message kembali memberitahu bahwa akun telah terdaftar
        if (user) {
          msg.reply(`*Akun kamu telah terdaftar tidak bisa daftar dengan nomor whatsapp yang sama*` + messageFormat.listCommand);
          return;
        }
        const hashingPassword = hashPassword(password);
        const newUser = await User.create({ phoneNumber: phoneNumberFormat, password: hashingPassword, role: 'seller' });
        msg.reply(messageFormat.register);
        return;
      }

      const user = await User.findOne({ where: { phoneNumber: phoneNumberFormat } });
      console.log(user.shopName);

      if (!user) {
        //Pengecekan user apakah user sudah ada di database atau tidak

        msg.reply(`*Akun dengan nomor whatsapp ${phoneNumberFormat} belum terdaftar silahkan daftar terlebih dahulu dengan mengirim pesan dengan format 1*`);
        return;
      }
      if (msg.body.startsWith('nama_toko:')) {
        //Pembuatan nama toko ketika si seller belum menambahkan nama toko
        //NOTE: Toko hanya bisa dibuat ketika seller register dan tidak bisa diubah kembali ketika si seller memasukkan command yang sama

        const shopName = msg.body.replace('nama_toko: ', '');
        if (user.shopName && user.shopName !== null) {
          msg.reply(`*Anda sudah memiliki nama toko yang bernama ${user.shopName} dan tidak bisa menggantinya lagi*` + messageFormat.listCommand);
          return;
        }

        //melakukan perubahan nama toko
        user.update({ shopName });

        client.sendMessage(msg.id.remote, `Nama toko ${shopName} telah ditambahkan pada akun anda` + messageFormat.listCommand);
        return;
      }

      if (user.shopName === null) {
        //Mengingatkan bahwa si seller harus memiliki nama toko sebelum dia bisa mengakses command yang lebih lengkap

        client.sendMessage(msg.id.remote, messageFormat.nameShop);
        return;
      }

      // Tambah Produk
      if (msg.body == '2') {
        //ambil token di database

        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGhvbmVOdW1iZXIiOiI2Mjg1MTYxMzYzOTgxIiwiaWF0IjoxNzAyNzQ3NTYyLCJleHAiOjE3MDI3NTExNjJ9.kbrq-4mQYzjg5yNGfFjGcAzpVCHtgo3WF4bLPtFq_VE';
        //decoded token

        const verifyTok = verifyToken(token);
        // console.log(verifyTok);
        const currentTime = Math.floor(Date.now() / 1000);
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber });
          console.log('expired');
          //update token di database
        } else {
          console.log('masih bisa digunakan');
        }
        msg.reply(`http://localhost:3000/shop/${user.id}/add-products?token=${token}`, null, { linkPreview: true });
        //mengirim link yang menuju ke tambah produk si seller
        return;
      } else if (msg.body == '3') {
        //Lihat katalog

        //ambil token di database
        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGhvbmVOdW1iZXIiOiI2Mjg1MTYxMzYzOTgxIiwiaWF0IjoxNzAyNzQ3NTYyLCJleHAiOjE3MDI3NTExNjJ9.kbrq-4mQYzjg5yNGfFjGcAzpVCHtgo3WF4bLPtFq_VE';
        //decoded token
        const verifyTok = verifyToken(token);
        console.log(verifyTok);
        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber });
          //update token di database
        } else {
          console.log('masih bisa digunakan');
        }
        msg.reply(`http://localhost:3000/shop/${user.id}/seller-products/:productId?token=${token}`, null, { linkPreview: true });
        //mengirim link yang menuju ke Katalog seller
        return;
      } else if (msg.body == '4') {
        // Lihat Daftar produk seller

        //ambil token di database
        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGhvbmVOdW1iZXIiOiI2Mjg1MTYxMzYzOTgxIiwiaWF0IjoxNzAyNzQ3NTYyLCJleHAiOjE3MDI3NTExNjJ9.kbrq-4mQYzjg5yNGfFjGcAzpVCHtgo3WF4bLPtFq_VE';
        //decoded token
        const verifyTok = verifyToken(token);
        console.log(verifyTok);
        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber });
          //update token di database
        } else {
          console.log('masih bisa digunakan');
        }
        msg.reply(`http://localhost:3000/shop/${user.id}/products`, null, { linkPreview: true });
        //mengirim link yang menuju ke Daftar produk seller
        return;
      } else if (msg.body == '5') {
        //ambil token di database
        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGhvbmVOdW1iZXIiOiI2Mjg1MTYxMzYzOTgxIiwiaWF0IjoxNzAyNzQ3NTYyLCJleHAiOjE3MDI3NTExNjJ9.kbrq-4mQYzjg5yNGfFjGcAzpVCHtgo3WF4bLPtFq_VE';
        //decoded token
        const verifyTok = verifyToken(token);
        console.log(verifyTok);
        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber });
          //update token di database
        } else {
          console.log('masih bisa digunakan');
        }
        msg.reply(`http://localhost:3000/invoices?token=${token}`, null, { linkPreview: true });
        //mengirim link yang menuju ke Daftar transaksi seller
        return;
      }

      client.sendMessage(msg.id.remote, 'Selamat datang! Saya adalah chatbot.' + messageFormat.listCommand);
    } catch (error) {
      console.log(error);
    }
  });
}

class Whatsapp {
  static async sendMessage(noHp, message) {
    try {
      client.sendMessage('6285161363981@c.us', 'ini tes');
    } catch (error) {
      console.log(error);
    }
  }
}

client.initialize();

module.exports = { message, Whatsapp };
