const route = require('express').Router()

route.get('/', (req, res) => {
    res.json("hallo geys")
});

module.exports = route; 