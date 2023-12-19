const { Client, LocalAuth } = require('whatsapp-web.js');
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
  const url = process.env.BASE_URL_CLIENT;
  client.on('message', async (msg) => {
    try {
      const phoneNum = msg.id.remote;
      const phoneNumberFormat = phoneNum.replace('@c.us', '');

      //Daftar sebagai seller
      if (msg.body == '1') {
        const user = await User.findOne({ where: { phoneNumber: phoneNumberFormat } });
        if (user) {
          client.sendMessage(msg.id.remote, `*Akun kamu telah terdaftar tidak bisa daftar dengan nomor whatsapp yang sama*` + messageFormat.listCommand);
          return;
        }
        client.sendMessage(
          msg.id.remote,
          `Untuk melakukan register anda harus membuat password untuk akun anda
Caranya dengan mengirim pesan 'password: <password anda>'
              
Contoh: 
password: petanisejahtera`
        );
        return;
      } else if (msg.body.startsWith('password:')) {
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
        msg.reply(messageFormat.register + 'Selanjutnya anda harus memasukkan nama toko dan alamat toko anda' + messageFormat.nameShop);
        return;
      }

      const user = await User.findOne({ where: { phoneNumber: phoneNumberFormat } });

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

        client.sendMessage(
          msg.id.remote,
          `Nama toko ${shopName} telah ditambahkan pada akun anda.

 ${messageFormat.address}       `
        );
        return;
      }

      if (msg.body.startsWith('kota:')) {
        //Pembuatan Alamat ketika si seller belum menambahkan Alamat
        //NOTE: Toko hanya bisa dibuat ketika seller register dan tidak bisa diubah kembali ketika si seller memasukkan command yang sama

        const address = msg.body.replace('kota: ', '');
        if (user.city && user.city !== null) {
          msg.reply(`*Anda sudah memiliki alamat kota di ${user.address} dan tidak bisa menggantinya lagi*` + messageFormat.listCommand);
          return;
        }

        //melakukan perubahan Alamat
        user.update({ city });

        client.sendMessage(msg.id.remote, `Alamat ${address} telah ditambahkan pada akun anda` + messageFormat.listCommand);
        return;
      }

      if (user.shopName === null) {
        //Mengingatkan bahwa si seller harus memiliki nama toko sebelum dia bisa mengakses command yang lebih lengkap

        client.sendMessage(msg.id.remote, messageFormat.nameShop);
        return;
      }

      if (user.city === null) {
        client.sendMessage(msg.id.remote, messageFormat.address);
        return;
      }

      // Tambah Produk
      if (msg.body == '2') {
        //ambil token di database

        let token = user.token;
        //decoded token

        if (!token) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        const verifyTok = verifyToken(token);
        //
        const currentTime = Math.floor(Date.now() / 1000);
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
          //update token di database
        }
        msg.reply(
          `*Klik link dibawah ini untuk menambahkan produk*

${url}/shop/${user.id}/add-products?token=${token}`,
          null,
          { linkPreview: true }
        );
        //mengirim link yang menuju ke tambah produk si seller
        return;
      } else if (msg.body == '3') {
        //Lihat katalog

        //ambil token di database
        let token = user.token;

        if (!token) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        //decoded token
        const verifyTok = verifyToken(token);
        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        msg.reply(
          `*Klik di bawah ini untuk menampilkan katalog produk yang tersedia*

${url}/shop/${user.id}/seller-products?token=${token}`,
          null,
          { linkPreview: true }
        );
        //mengirim link yang menuju ke Katalog seller
        return;
      } else if (msg.body == '4') {
        // Lihat Daftar produk seller

        //ambil token di database
        let token = user.token;

        if (!token) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        //decoded token
        const verifyTok = verifyToken(token);
        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        const userWithProducts = await User.findByPk(user.id, {
          include: {
            association: 'products',
            include: {
              association: 'product',
            },
          },
        });

        const messageList = userWithProducts.products.map((el, index) => {
          return `${index + 1}. ${el.product.productName}
- Stock: ${el.stock}
`;
        });

        const listProduk = messageList.join('\r\n');

        console.log(listProduk);

        msg.reply(`Dibawah ini adalah list produk yang anda punya

${listProduk}
Jika anda ingin melakukan penambahan stock anda harus mengirim pesan "edit <nomor>"

contoh: edit 1`);
        //mengirim link yang menuju ke Daftar produk seller
        return;
      } else if (msg.body == '5') {
        //List Transaksi

        //ambil token di database
        let token = user.token;

        if (!token) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        //decoded token
        const verifyTok = verifyToken(token);

        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }
        msg.reply(
          `*Klik link dibawah ini untuk menampilkan list transaksi yang anda punya*

${url}/invoices?token=${token}`,
          null,
          { linkPreview: true }
        );
        //mengirim link yang menuju ke Daftar transaksi seller
        return;
      }

      if (msg.body.startsWith('edit')) {
        const index = msg.body.replace('edit ', '');

        let token = user.token;

        if (!token) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        //decoded token
        const verifyTok = verifyToken(token);

        const currentTime = Math.floor(Date.now() / 1000);
        //verifyToken
        if (verifyTok.exp && verifyTok.exp < currentTime) {
          token = signToken({ id: user.id, phoneNumber: user.phoneNumber, role: user.role });
          //update token di database
          await user.update({ token });
        }

        const userWithProducts = await User.findByPk(user.id, {
          include: {
            association: 'products',
            include: {
              association: 'product',
            },
          },
        });

        const productId = userWithProducts.products[+index - 1].id;

        msg.reply(
          `*Klik link di bawah ini untuk melakukan edit pada produk ${userWithProducts.products.product}*
        
${url}/shop/${user.id}/seller-products/${productId}?token=${token}`,
          null,
          { linkPreview: true }
        );
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
      const phoneNumFormat = noHp + '@c.us';
      await client.sendMessage(phoneNumFormat, message);
      return 'success';
    } catch (error) {
      console.log(error);
      return 'error';
    }
  }
}

client.initialize();

module.exports = { message, Whatsapp };
