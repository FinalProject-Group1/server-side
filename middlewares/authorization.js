const {SellerProduct} = require('../models');
async function authorizationEdit(req, res, next){
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

async function authorizationAdd(req, res, next){
    try {
        if(req.user.role !== 'seller') throw ({name: "Forbidden"})
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    authorizationAdd,
    authorizationEdit
}