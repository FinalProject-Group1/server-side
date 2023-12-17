
const route = require('express').Router()
const InvoiceController = require('../controllers/InvoiceController');
const PaymentGate = require('../controllers/PaymentGate');
const ProductController = require('../controllers/ProductController');
const SellerProductController = require('../controllers/SellerProductController');
const UserController = require('../controllers/UserController');
const authentication = require('../middlewares/authentication');
const { authorizationAdd, authorizationEdit } = require('../middlewares/authorization');

const error = require('../middlewares/errorHandler')

 
route.post('/register', UserController.login);
route.post('/login', UserController.login);
route.get('/invoice/:id', InvoiceController.getInvoice)
route.use(authentication)
route.get('/products', ProductController.getProducts)
route.get('/profile', UserController.profile)
route.get('/user/:id', UserController.getUserId)
route.get('/seller-products', SellerProductController.getAllSeller)
route.post('/seller-products', authorizationAdd, SellerProductController.sellerAdd)
route.get('/seller-products/:id', SellerProductController.sellerFindById)
route.get('/payment', PaymentGate.getMidtransToken)
route.put('/seller-products/:id', authorizationEdit, SellerProductController.sellerEdit)


route.use(error);

module.exports = route;
