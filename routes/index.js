const route = require('express').Router();
const InvoiceController = require('../controllers/InvoiceController');
const PaymentGate = require('../controllers/PaymentGate');
const ProductController = require('../controllers/ProductController');
const SellerProductController = require('../controllers/SellerProductController');
const UserController = require('../controllers/UserController');
const authentication = require('../middlewares/authentication');
const { authorizationAdd, authorizationEdit, authorizationBuyer } = require('../middlewares/authorization');

const error = require('../middlewares/errorHandler');

route.post('/register', UserController.registerBuyer);
route.post('/login', UserController.login);
route.post('/payment-success', PaymentGate.success);
route.get('/products', ProductController.getProducts);
route.get('/seller-products', SellerProductController.getAllSeller);
route.get('/user/:id', UserController.getUserId);
route.get('/products/:id', ProductController.getProductById);
route.use(authentication);
route.get('/user/seller-products', UserController.mySellerProducts);
route.get('/invoice/:id', InvoiceController.getInvoice);
route.get('/invoices-seller', UserController.sellerInvoice);
route.get('/invoices-buyer', UserController.buyerInvoice);
route.get('/profile', UserController.profile);
route.post('/seller-products', authorizationAdd, SellerProductController.sellerAdd);
route.get('/seller-products/:id', SellerProductController.sellerFindById);
route.post('/payment', authorizationBuyer, PaymentGate.getMidtransToken);
route.post('/order', authorizationBuyer, InvoiceController.createInvoice);
route.put('/seller-products/:id', authorizationEdit, SellerProductController.sellerEdit);
route.put('/seller-order', InvoiceController.editInvoiceSeller);
route.put('/seller-order-cancel', InvoiceController.editInvoiceCancelSeller);
route.put('/buyer-order', InvoiceController.editInvoiceBuyer);

route.use(error);

module.exports = route;
