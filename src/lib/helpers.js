const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password) =>{
    const salt = await bcrypt.getSalt(10);    
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helpers.matchPassword = async (password, savePassword) =>{
    try{
        return await bcrypt.compare(password, savePassword);
    }catch (err){
        console.log(err);
    }
};

helpers.moneda = (n) => {
    return Number(Number.parseFloat(n).toFixed(2));
}

helpers.dimensiones = (n) => {
    return Number(Number.parseFloat(n).toFixed(3));
}

module.exports = helpers;