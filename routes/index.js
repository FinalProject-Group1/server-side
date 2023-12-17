const route = require('express').Router()
const ProductController = require('../controllers/ProductController');
const SellerProductController = require('../controllers/SellerProductController');
const UserController = require('../controllers/UserController');
const authentication = require('../middlewares/authentication');
const authorization = require('../middlewares/authorization');
const error = require('../middlewares/errorHandler')


route.post('/login', UserController.login);
route.use(authentication)
route.get('/products', ProductController.getProducts)
route.get('/user/:id', UserController.getUserId)
route.post('/seller-products', SellerProductController.sellerAdd)
route.get('/seller-products/:id', SellerProductController.sellerFindById)
route.put('/seller-products/:id', authorization, SellerProductController.sellerEdit)

route.use(error)

module.exports = route; 