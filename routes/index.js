const route = require('express').Router();
const { client } = require('../app');
const { Whatsapp } = require('../controllers/whatsapp');
const error = require('../middlewares/errorHandler');

route.get('/', async (req, res) => {
  res.json('hallo geys');
});

route.use(error);

module.exports = route;
