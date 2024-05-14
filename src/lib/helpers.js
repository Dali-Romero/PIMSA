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
        try{
            browserPup = await puppeteer.launch({
                args: ['--no-sandbox'],
                headless: 'new'
                
            })
        } catch (error){
            console.error("No jala, error: ", error);
        }
        
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

helpers.filterOthersOutCatalog = (acumulador, arreglo) => {
    if(arreglo.dentro == false){
        const fuera = acumulador.find(function(arreglo){
            return arreglo.categoria == 'Fuera de catálogo';
        })
        if(!fuera){
            acumulador.push({categoria: 'Fuera de catálogo', compras: parseFloat(arreglo.compras), nombres: `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`});
        }else{
            fuera.compras += parseFloat(arreglo.compras);
            if (arreglo.compras > 10000){
                fuera.nombres += `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`;
            }
        }
    }else{
        if(arreglo.compras <= 1000){
            const otros = acumulador.find(function(arreglo){
                return arreglo.categoria == 'Otros';
            })
            if(!otros){
                acumulador.push({categoria: 'Otros', compras: parseFloat(arreglo.compras), nombres: `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`});
            }else{
                otros.compras += parseFloat(arreglo.compras);                        
                otros.nombres += `$ (${Number(arreglo.compras).toLocaleString(undefined, {minimumFractionDigits: 2})}) ${arreglo.nombre_productos}\n`;
            }
        }else{
            acumulador.push({categoria: arreglo.nombre_productos, compras: parseFloat(arreglo.compras), nombres: arreglo.nombre_productos});
        }
    }
    return acumulador;
}

module.exports = helpers;