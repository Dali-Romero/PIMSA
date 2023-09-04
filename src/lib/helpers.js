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

module.exports = helpers;