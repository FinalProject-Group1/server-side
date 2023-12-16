const route = require('express').Router()
const error = require('../middlewares/errorHandler')


route.get('/', (req, res) => {
    res.json("hallo geys")
});

route.use(error)

module.exports = route; 