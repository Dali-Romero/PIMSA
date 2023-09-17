const express = require('express');
const hbs = require('handlebars');
const fs = require('fs');
const {Stream} = require('stream');
const pool = require('../database.js');
const {moneda, dimensiones, createPdf} = require('../lib/helpers.js');
const { isLoggedIn } = require('../lib/auth.js');
const path = require('path');
require('../lib/handlebars.js');

const router = express.Router();

router.get('/add', isLoggedIn, async (req, res)=>{
    const productos = await pool.query('SELECT productoId, nombre FROM Productos ORDER BY nombre ASC;');
    const clientes = await pool.query('SELECT clienteId, nombre FROM Clientes ORDER BY nombre ASC;');
    res.render('quotations/add', {productos: productos, clientes: clientes});
});

router.post('/add', isLoggedIn, async (req, res)=>{
    const cotizacion = req.body.data.cotizacion;
    const productos = req.body.data.productos;
    const newCot = {
        fecha: cotizacion.fecha,
        cliente_id: cotizacion.cliente_id,
        proyecto: cotizacion.proyecto,
        observaciones: cotizacion.observaciones,
        porcentajeDescuento: Number(cotizacion.porcentajeDescuento),
        solicitante: cotizacion.solicitante,
        empleado: cotizacion.empleado,
        estatus: cotizacion.estatus,
        totalBruto: cotizacion.totalBruto,
        descuento: cotizacion.descuento,
        subtotal: cotizacion.subtotal,
        iva: cotizacion.iva,
        total: cotizacion.total
    };
    const {insertId} = await pool.query('INSERT INTO Cotizaciones SET ?;', [newCot]);
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
        await pool.query('INSERT INTO ProductosCotizados (cot_id, cantidad, producto_id, acabados, archivo, largo, ancho, area, precioCadaUno, monto, precio) VALUES ?;', [productosEnCatalogo]);
    }
    if (ProductosFueraCatalogo.length > 0){
        await pool.query('INSERT INTO FueraCatalogoCotizados (cot_id, cantidad, concepto, acabados, archivo, precio, unidad, largo, ancho, area, precioCadaUno, monto) VALUES ?;', [ProductosFueraCatalogo]);
    }

    req.flash('success', 'La cotización <b>COT-'+insertId+'</b> ha sido creada correctamente');
    res.send({url: '/quotations'});
})

router.post('/listProducts', isLoggedIn, async (req, res)=>{
    const productoId = req.body.idProduct;
    const producto = await pool.query('SELECT productoId, nombre, unidad, precio FROM Productos WHERE productoId = ?;', [productoId]);
    res.send({producto: producto[0]});
})

router.post('/discountClient', isLoggedIn, async (req, res)=>{
    const clienteId = req.body.clientid;
    const descuento = await pool.query('SELECT descuento FROM Clientes WHERE clienteId = ?;', [clienteId]);
    res.send({descuento: descuento[0]});
})

router.post('/preview', isLoggedIn, async (req, res)=>{
    const body = req.body.inputs;
    const usruarioId = req.user.usuarioId;
    const clienteId = body.clientid;
    const empleado = await pool.query('SELECT Empleados.nombreComp FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?;', [usruarioId]);
    const cliente = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?;', [clienteId]);
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

router.get('/', isLoggedIn, async (req, res)=>{
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId);');
    res.render('quotations/list', {cotizaciones: cotizaciones});
})

router.get('/info/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT * FROM Cotizaciones WHERE cotId = ?', [id]);
    const cliente = await pool.query('SELECT * FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);
    res.render('quotations/info', {cotizacion: cotizacion[0], cliente: cliente[0], productos: productos});
})

router.get('/cancel/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    await pool.query('UPDATE Cotizaciones SET estatus = "Cancelada" WHERE cotId = ?', [id]);
    res.redirect('/quotations/info/' + id);
})

router.get('/edit/:id', isLoggedIn, async (req,res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT * FROM Cotizaciones WHERE cotId = ?', [id]);
    const productos = await pool.query('SELECT productoId, nombre FROM Productos ORDER BY nombre ASC;');
    const clientes = await pool.query('SELECT clienteId, nombre FROM Clientes ORDER BY nombre ASC;');
    const cliente = await pool.query('SELECT clienteId FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    
    // asignar que productos estan en catalogo y cuales no;
    productosEnCatalogo.forEach(producto =>{
        producto.fueraCatalogo = '0' 
    })
    productosFueraCatalogo.forEach(producto =>{
        producto.fueraCatalogo = '1' 
    })
    const productosCotizados = productosEnCatalogo.concat(productosFueraCatalogo);

    // renderizar vista
    res.render('quotations/edit', {cotizacion: cotizacion[0], clientes:clientes, cliente: cliente[0], productos: productos, productosCotizados: productosCotizados});
})

router.post('/edit/:id', async(req, res)=>{
    const {id} = req.params;
    const cotizacion = req.body.data.cotizacion;
    const productos = req.body.data.productos;

    // ordenar cotizacion
    const newCot = {
        fecha: cotizacion.fecha,
        cliente_id: cotizacion.cliente_id,
        proyecto: cotizacion.proyecto,
        observaciones: cotizacion.observaciones,
        porcentajeDescuento: Number(cotizacion.porcentajeDescuento),
        solicitante: cotizacion.solicitante,
        empleado: cotizacion.empleado,
        estatus: cotizacion.estatus,
        totalBruto: cotizacion.totalBruto,
        descuento: cotizacion.descuento,
        subtotal: cotizacion.subtotal,
        iva: cotizacion.iva,
        total: cotizacion.total
    };

    // actualizar cotizacion
    await pool.query('UPDATE Cotizaciones SET ? WHERE cotId = ?', [newCot, id]);

    // eliminar productos cotizados
    await pool.query('DELETE FROM ProductosCotizados WHERE cot_id = ?', [id]);
    await pool.query('DELETE FROM FueraCatalogoCotizados WHERE cot_id = ?', [id]);

    // ordenar productos
    let productosEnCatalogo = [];
    let ProductosFueraCatalogo = [];
    let newProducto = [];
    productos.forEach(producto => {
        if(producto.isoutcatalog === '0'){
            newProducto = [
                Number(id),
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
                Number(id),
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

    // agregar nuevos productos cotizados
    if (productosEnCatalogo.length > 0){
        await pool.query('INSERT INTO ProductosCotizados (cot_id, cantidad, producto_id, acabados, archivo, largo, ancho, area, precioCadaUno, monto, precio) VALUES ?;', [productosEnCatalogo]);
    }
    if (ProductosFueraCatalogo.length > 0){
        await pool.query('INSERT INTO FueraCatalogoCotizados (cot_id, cantidad, concepto, acabados, archivo, precio, unidad, largo, ancho, area, precioCadaUno, monto) VALUES ?;', [ProductosFueraCatalogo]);
    }
    req.flash('success', 'La cotización <b>COT-'+id+'</b> ha sido editada correctamente');
    res.send({url: '/quotations'});
})

router.post('/email/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const correoCliente = req.body.inputEmailClient;
    console.log(id, correoCliente);
})

router.get('/download/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT * FROM Cotizaciones WHERE cotId = ?', [id]);
    const cliente = await pool.query('SELECT * FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

    // leer imagen del logo
    const bitMap = fs.readFileSync(path.join(process.cwd(), 'src', 'public', 'img', 'PIMSAlogo.png'));
    const buffer = Buffer.from(bitMap).toString('base64');
    const imgSrc = `data:image/png;base64,${buffer}`;

    // compilar template para el archivo pdf
    const source = fs.readFileSync(path.join(process.cwd(), 'src', 'views', 'quotations', 'pdfTemplate.hbs'), 'utf8');
    const template = hbs.compile(source);
    const context = {
        pimsaLogo: imgSrc,
        cotizacion: cotizacion[0],
        cliente: cliente[0],
        productos: productos
    }
    const html = template(context);

    // construir el archivo pdf
    const timeMilis = new Date().getTime();
    const readStream = Stream.PassThrough();
    const options = {
        format: 'Letter',
		margin: {
			top: "30px",
			bottom: "30px",
            left: "20px",
            right: "20px"
		},
		printBackground: true,
        scale: 0.75,
    }

    const pdf = await createPdf(html, options)
    readStream.end(pdf);

    // enviar archivo pdf
    res.attachment(`cot${id}_${timeMilis}.pdf`);
    res.contentType('application/pdf');
    readStream.pipe(res).on('error', function(e){console.error(e)});
})

module.exports = router;