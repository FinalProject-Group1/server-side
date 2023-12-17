const {SellerProduct} = require('../models');
async function authorization(req, res, next){
    try {
        const seller = await SellerProduct.findByPk(req.params.id);
        if(!seller) throw ({name: "NotFound"});
        if(req.user.id !== seller.SellerId){
            throw ({name: "Forbidden"})
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authorization