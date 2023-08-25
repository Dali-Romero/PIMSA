const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();

function moneda(x) {
    return Number(Number.parseFloat(x).toFixed(2));
}

function dimensiones(x) {
    return Number(Number.parseFloat(x).toFixed(3));
}

router.get('/add', async (req, res)=>{
    const products = await pool.query('SELECT productoId, nombre FROM Productos');
    res.render('quotations/add', {products: products});
});

router.post('/add', async (req, res)=>{

})

router.post('/preview', async (req, res)=>{
    const body = req.body;
    const usrId = req.user.usuarioId;
    const clienteId = body.clientid;
    const usr = await pool.query('SELECT Empleados.nombreComp FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?', [usrId]);
    const cliente = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [clienteId]);

    // obtener informacion de los productos 
    let i = 0;
    const productos = {};
    const valoresBody = Object.values(body);
    for (const key in body) {
        if (i>5) {
            productos[key] = valoresBody[i];
        }
        i++;
    }

    // crear un arreglo con todos los productos
    let j = 0;
    let productosCot = {};
    let productosCotArray = [];
    const valoresProductos = Object.values(productos);
    for (const key in productos) {
        if (j !==0 && j%9 === 0) {
            productosCotArray.push(productosCot);
            productosCot = {};
        }
        productosCot[key.replace(/[0-9]/g, '')] = valoresProductos[j];
        j++;
    }
    productosCotArray.push(productosCot);

    // calculos de la cotizacion
    let bruto = 0;
    let subtotal = 0;
    let descuento = 0;
    let iva = 0
    productosCotArray.forEach(producto => {
        if(producto.unitproduct === 'Mt'){
            producto.measure = dimensiones(producto.widthproduct * producto.heightproduct);
            producto.priceach = moneda(producto.measure * producto.priceproduct);
            producto.amount = moneda(producto.priceach * producto.quantityproduct);
        }else{
            producto.measure = dimensiones(producto.widthproduct * producto.heightproduct);
            producto.priceach = moneda(producto.measure * producto.priceproduct);
            producto.amount = moneda(producto.priceproduct * producto.quantityproduct);
        }
        bruto = bruto + producto.amount;
        bruto = moneda(bruto);
    });
    descuento = moneda((body.numdiscount*bruto)/100);
    subtotal = moneda(bruto-descuento);
    iva = moneda((16*subtotal)/100);
    total = moneda(subtotal + iva);

    // crear datos de factura (calculos de la cotizacion)
    const factura = {
        discount: descuento,
        subtotal: subtotal,
        taxes: iva,
        total: total
    }

    // crear cotizacion
    const cot = {
        cliente_id: body.clientid,
        representante: body.nameapplicant,
        proyecto: body.nameproyect,
        observaciones: body.observations,
        elaboro: usr[0].nombreComp,
        estatus: 'G',
        descuento: body.numdiscount,
        subtotal: subtotal,
        total: total
    }

    console.log(productosCotArray);
    //res.render('quotations/preview', {products:productosCotArray});
})

router.post('/listProducts', async (req, res)=>{
    const id = req.body.idProduct;
    const products = await pool.query('SELECT productoId, nombre FROM Productos');
    const product = await pool.query('SELECT productoId, nombre, unidad, precio FROM Productos WHERE productoId = ?', [id]);
    res.send({products: products, product: product[0]});
})

module.exports = router;