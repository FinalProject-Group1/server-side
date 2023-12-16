const route = require('express').Router()
const ProductController = require('../controllers/ProductController');
const UserController = require('../controllers/UserController');
const authentication = require('../middlewares/authentication');
const error = require('../middlewares/errorHandler')


route.post('/login', UserController.login);
route.get('/user/:id', UserController.getUserId)
route.use(authentication)
route.get('/products', ProductController.getProducts)

route.use(error)

module.exports = route; 