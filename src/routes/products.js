const express = require('express');
const pool = require('../database');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const router = express.Router();
const { validateProducts } = require('../lib/validators');
const { validationResult } = require('express-validator');

router.get('/', isLoggedIn, IsAuthorized('seeListProducts'), async (req, res) =>{
    const products = await pool.query('SELECT * FROM productos');
    const procesos = await pool.query('SELECT * FROM procesos');
    res.render('../views/products/allProducts', {products, procesos});
});

router.get('/add', isLoggedIn, IsAuthorized('addProducts'), async (req, res) =>{
    const procesos = await pool.query('SELECT * FROM procesos WHERE NOT nombre = "Personalizado"');
    console.log(procesos);
    res.render('../views/products/addProduct', {procesos});
});

router.post('/add', isLoggedIn, IsAuthorized('addProducts'), validateProducts(), async (req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        var product = req.body;
        if (product.descuento == 0){
            product.porcentaje = 0;
        }
        const newProduct = {
            nombre: product.nombre,
            descripcion: product.descripcion,
            unidad: product.unidadMedida,
            precio: product.precio,
            aplicarDescuento: product.descuento,
            porcentaje: product.porcentaje,
            proceso_id: product.proceso
        };
        pool.query('INSERT into productos SET ?', [newProduct]);
        req.flash('success', 'Producto agregado correctamente.');
        res.redirect('/products');

    } else {
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/products/add');
    }
    

});

router.get('/edit/:id', isLoggedIn, IsAuthorized('editProducts'), async (req, res) =>{
    const {id} = req.params;
    const product = await pool.query('SELECT * FROM productos WHERE productoId = ?', [id]);
    const editProduct = {
        proceso: await pool.query('SELECT * FROM procesos WHERE NOT nombre = "Personalizado"'),
        proceso_id: product[0].proceso_id
    }

    res.render('products/editProduct', {product: product[0], editProduct});

});

router.post('/edit/:id', isLoggedIn, IsAuthorized('editProducts'), validateProducts(), async (req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});
    const {id} = req.params;

    // En caso de no existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        var product = req.body;
        console.log(product);
        if (product.descuento == 0){
            product.porcentaje = 0;
        }
        const editProduct = {
            nombre: product.nombre,
            descripcion: product.descripcion,
            unidad: product.unidadMedida,
            precio: product.precio,
            aplicarDescuento: product.descuento,
            porcentaje: product.porcentaje,
            proceso_id: product.proceso
        };
        pool.query('UPDATE productos SET ? WHERE productoId = ?', [editProduct, id]);
        req.flash('success', 'Producto modificado correctamente.');
        res.redirect('/products');
        
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/products/edit/'+id);
    }
});


module.exports = router;