function errorHandler(error, req, res, next) {
    let statCode, message;
    switch (error.name) {
        case "SequelizeValidationError":
        case "SequelizeUniqueConstraintError":
            statCode = 400;
            message = error.errors.map(el => {
                return el.message;
            });
            break;
        case "NullPhoneNumber":
            statCode = 400;
            message = ["Phone Number is missing"];
            break;
        case "NullPassword":
            statCode = 400;
            message = ["Password is missing"];
            break;
        case "AddError":
            statCode = 400;
            message = ["Tidak bisa menambahkan barang yang sudah ada"];
            break;
        case "NullFile":
            statCode = 400;
            message = ["File is missing"];
            break;
        case "FieldMissing":
            statCode = 400;
            message = ["Please fill all the field"];
            break;
        case "StockKurang":
            statCode = 400;
            message = error.message ? error.message : "Stocknya Kurang Bro!!!";
            break;
        case "SameShop":
            statCode = 400;
            message = ["Tidak bisa membeli barang di tempat yang sama"];
            break;
        case "NotSeller":
            statCode = 400;
            message = ["User yang anda tuju bukan penjual"];
            break;
        case "ErrorPhoneorPassword":
            statCode = 401;
            message = ["Invalid phonenumber/password"];
            break;
        case "JsonWebTokenError":
            statCode = 401;
            message = ["Invalid JWT Token"];
            break;
        case "Unauthenticated":
            statCode = 401;
            message = ["Unauthenticated"];
            break;
        case "Forbidden":
            statCode = 403;
            message = ["You are not authorized"];
            break;
        case "NotFound":
            statCode = 404;
            message = ["Data not found"] ;
            break;
        default:
            statCode = 500;
            message = ["Internal server error"];
            break;
    }
    res.status(statCode).json({ message });
}

module.exports = errorHandler;