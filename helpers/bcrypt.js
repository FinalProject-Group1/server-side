const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}
const comparePassword = (pwd, hashedpassword) => {
    return bcrypt.compareSync(pwd, hashedpassword);
}



module.exports = {
    hashPassword,
    comparePassword
};