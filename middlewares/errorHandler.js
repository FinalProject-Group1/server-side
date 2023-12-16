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
        case "NullEmail":
            statCode = 400;
            message = ["Email is missing"];
            break;
        case "NullPassword":
            statCode = 400;
            message = ["Password is missing"];
            break;
        case "NullFile":
            statCode = 400;
            message = ["File is missing"];
            break;
        case "ErrorEmailorPassword":
            statCode = 401;
            message = ["Invalid email/password"];
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