const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer');

// variables globales
let browserPup;

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

helpers.createPdf = async (html, options) => {
    if (!browserPup){
        browserPup = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless: 'new'
        })
    }

    const page = await browserPup.newPage();
    await page.setContent(html);
    const pdf = await page.pdf(options);
    await page.close();
    return pdf;
}

helpers.filterOthers = (acumulador, arreglo) => {
    if(arreglo.compras <= 1000){
        const otros = acumulador.find(function(arreglo){
            return arreglo.categoria == 'Otros';
        })
        if(!otros){
            acumulador.push({categoria: 'Otros', compras: parseFloat(arreglo.compras), nombres: `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.categoria}\n`});
        }else{
            otros.compras += parseFloat(arreglo.compras);                        
            otros.nombres += `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.categoria}\n`;
        }
    }else{
        acumulador.push({categoria: arreglo.categoria, compras: parseFloat(arreglo.compras), nombres: arreglo.categoria});
    }
    return acumulador;
}

module.exports = helpers;