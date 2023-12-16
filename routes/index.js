const route = require('express').Router()
const ProductController = require('../controllers/ProductController');
const UserController = require('../controllers/UserController');
const authentication = require('../middlewares/authentication');
const error = require('../middlewares/errorHandler')


route.post('/login', UserController.login);
route.use(authentication)
route.get('/products', ProductController.getProducts)
route.get('/user/:id', UserController.getUserId)
route.post('/seller-products', ProductController.sellerAdd)

route.use(error)

module.exports = route; 