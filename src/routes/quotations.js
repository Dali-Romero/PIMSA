const express = require('express');
const pool = require('../database.js');
const {moneda, dimensiones} = require('../lib/helpers.js');
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();

router.get('/add', async (req, res)=>{
    const productos = await pool.query('SELECT productoId, nombre FROM Productos ORDER BY nombre ASC');
    const clientes = await pool.query('SELECT clienteId, nombre FROM Clientes ORDER BY nombre ASC')
    res.render('quotations/add', {productos: productos, clientes: clientes});
});

router.post('/add', async (req, res)=>{
    const body = req.body.data;
    const productos = req.body.data.productos;
    const newCot = {
        fecha: body.cotizacion.fecha,
        cliente_id: body.cotizacion.cliente_id,
        proyecto: body.cotizacion.proyecto,
        observaciones: body.cotizacion.observaciones,
        porcentajeDescuento: Number(body.cotizacion.porcentajeDescuento),
        solicitante: body.cotizacion.solicitante,
        empleado: body.cotizacion.empleado,
        estatus: body.cotizacion.estatus,
        totalBruto: body.cotizacion.totalBruto,
        descuento: body.cotizacion.descuento,
        subtotal: body.cotizacion.subtotal,
        iva: body.cotizacion.iva,
        total: body.cotizacion.total
    };
    const {insertId} = await pool.query('INSERT INTO Cotizaciones SET ?', [newCot]);
    let productosEnCatalogo = [];
    let ProductosFueraCatalogo = [];
    let newProducto = [];
    productos.forEach(producto => {
        if(producto.isoutcatalog === '0'){
            newProducto = [
                Number(insertId),
                producto.quantityproduct,
                producto.productId,
                producto.coatingproduct,
                producto.fileproduct,
                Number(producto.lengthproduct),
                Number(producto.widthproduct),
                producto.measure,
                producto.priceach,
                producto.amount,
                Number(producto.priceproduct)
            ]
            productosEnCatalogo.push(newProducto);
            newProducto = [];
        }else{
            newProducto = [
                Number(insertId),
                Number(producto.quantityproduct),
                producto.nameproduct,
                producto.coatingproduct,
                producto.fileproduct,
                Number(producto.priceproduct),
                producto.unitproduct,
                Number(producto.lengthproduct),
                Number(producto.widthproduct),
                producto.measure,
                producto.priceach,
                producto.amount
            ]
            ProductosFueraCatalogo.push(newProducto);
            newProducto = [];
        }
    });

    if (productosEnCatalogo.length > 0){
        await pool.query('INSERT INTO ProductosCotizados (cot_id, cantidad, producto_id, acabados, archivo, largo, ancho, area, precioCadaUno, monto, precio) VALUES ?', [productosEnCatalogo]);
    }
    if (ProductosFueraCatalogo.length > 0){
        await pool.query('INSERT INTO FueraCatalogoCotizados (cot_id, cantidad, concepto, acabados, archivo, precio, unidad, largo, ancho, area, precioCadaUno, monto) VALUES ?', [ProductosFueraCatalogo]);
    }

    req.flash('success', 'Cotización <b>COT-'+insertId+'</b> ha sido creada correctamente');
    res.send({url: '/quotations'});
})

router.post('/listProducts', async (req, res)=>{
    const productoId = req.body.idProduct;
    const producto = await pool.query('SELECT productoId, nombre, unidad, precio FROM Productos WHERE productoId = ?', [productoId]);
    res.send({producto: producto[0]});
})

router.post('/discountClient', async (req, res)=>{
    const clienteId = req.body.clientid;
    const descuento = await pool.query('SELECT descuento FROM Clientes WHERE clienteId = ?', [clienteId]);
    res.send({descuento: descuento[0]});
})

router.post('/preview', async (req, res)=>{
    const body = req.body.inputs;
    const usruarioId = req.user.usuarioId;
    const clienteId = body.clientid;
    const empleado = await pool.query('SELECT Empleados.nombreComp FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?', [usruarioId]);
    const cliente = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [clienteId]);
    const date = new Date();

    // formatos de fecha
    fecha = date.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute: 'numeric', hour12: false});

    // obtener informacion de los productos 
    let i = 0;
    const productos = {};
    const valoresBody = Object.values(body);
    for (const key in body) {
        if (i>6) {
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
        if (j !==0 && j%10 === 0) {
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
    let iva = 0;
    productosCotArray.forEach(producto => {
        if(producto.unitproduct === 'Mt'){
            producto.measure = dimensiones(producto.lengthproduct * producto.widthproduct);
            producto.priceach = moneda(producto.measure * producto.priceproduct);
            producto.amount = moneda(producto.priceach * producto.quantityproduct);
        }else{
            producto.measure = dimensiones(producto.lengthproduct * producto.widthproduct);
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

    // crear cotizacion
    const cot = {
        fecha: fecha,
        cliente_id: body.clientid,
        solicitante: body.nameapplicant,
        proyecto: body.nameproyect,
        observaciones: body.observations,
        empleado: empleado[0].nombreComp,
        estatus: 'Generada',
        totalBruto: bruto,
        porcentajeDescuento: body.numdiscount,
        descuento: descuento,
        subtotal: subtotal,
        iva: iva,
        total:total
    }

    res.send({cotizacion:cot, cliente: cliente[0], productos: productosCotArray});
})

router.get('/', async (req, res)=>{
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId)');
    res.render('quotations/list', {cotizaciones: cotizaciones});
})

module.exports = router;