const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();

router.get('/add', async (req, res)=>{
    const products = await pool.query('SELECT productoId, nombre FROM Productos');
    res.render('quotations/add', {products: products});
});

router.post('/add', async (req, res)=>{
    const body = req.body;
    const usrId = req.user.usuarioId;
    const usr = await pool.query('SELECT Empleados.nombreComp FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?', [usrId]);
    const cot = {
        cliente_id: body.clientid,
        representante: body.nameapplicant,
        proyecto: body.nameproyect,
        observaciones: body.observations,
        elaboro: usr[0].nombreComp,
        estatus: 'Pendiente',
        descuento: body.numdiscount,
        total: 'Pendiente'
    }

    let i = 0;
    const productos = {};
    const valoresBody = Object.values(body);
    for (const key in body) {
        if (i>5) {
            productos[key] = valoresBody[i];
        }
        i++;
    }

    let j = 0;
    let productosCot = {};
    let productosCotArray = [];
    const valoresProductos = Object.values(productos);
    for (const key in productos) {
        if (j !==0 && j%9 === 0) {
            productosCotArray.push(productosCot);
            productosCot = {};
        }
        productosCot[key] = valoresProductos[j];
        j++;
    }
    productosCotArray.push(productosCot);
    res.render('quotations/preview.hbs', {products:productosCotArray});
})

router.post('/listProducts', async (req, res)=>{
    const id = req.body.idProduct;
    const products = await pool.query('SELECT productoId, nombre FROM Productos');
    const product = await pool.query('SELECT productoId, nombre, unidad, precio FROM Productos WHERE productoId = ?', [id]);
    res.send({products: products, product: product[0]});
})

module.exports = router;