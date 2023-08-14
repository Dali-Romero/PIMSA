const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, async (req, res) =>{
    const products = await pool.query('SELECT * FROM productos');
    const procesos = await pool.query('SELECT * FROM procesos');
    res.render('../views/products/allProducts', {products, procesos});
});

router.post('/', isLoggedIn, async (req, res) =>{
    const {buscar, productSearchField} = req.body;
    const products = await pool.query('SELECT * FROM productos');
    const procesos = await pool.query('SELECT * FROM procesos');
    
    res.render('../views/products/allProducts', {products, procesos}); 
});

router.get('/add', isLoggedIn, async (req, res) =>{
    const procesos = await pool.query('SELECT * FROM procesos');
    console.log(procesos[0].nombre);
    res.render('../views/products/addProduct', {procesos});
});

router.post('/add', isLoggedIn, async (req, res) =>{
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
    req.flash('success_msg', 'Producto agregado correctamente.');
    res.redirect('/products');

});

router.get('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const product = await pool.query('SELECT * FROM productos WHERE productoId = ?', [id]);
    const editProduct = {
        proceso: await pool.query('SELECT * FROM procesos'),
        proceso_id: product[0].proceso_id
    }
    console.log(editProduct);
    res.render('products/editProduct', {product: product[0], editProduct});

});

router.post('/edit/:id', isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    var product = req.body;
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
    console.log('Porcentaje: ' + editProduct.porcentaje)
    pool.query('UPDATE productos SET ? WHERE productoId = ?', [editProduct, id]);
    req.flash('success_msg', 'Producto modificado correctamente.');
    res.redirect('/products');

});


module.exports = router;