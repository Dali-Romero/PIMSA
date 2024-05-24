const express = require('express');
const hbs = require('handlebars');
const fs = require('fs');
const {Stream} = require('stream');
const path = require('path');
const nodemailer = require('nodemailer');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const {moneda, dimensiones, createPdfQuotations} = require('../lib/helpers.js');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { validateQuotations, validateQuotationsInfoProduct, validateQuotationsDiscountClient, validateQuotationsEmialClient, validateExtaskCreateOrder } = require('../lib/validators.js');
require('../lib/handlebars.js');

const router = express.Router();

router.get('/add', isLoggedIn, IsAuthorized('addQuotations'), async (req, res)=>{
    const productos = await pool.query('SELECT productoId, nombre FROM Productos ORDER BY nombre ASC;');
    const clientes = await pool.query('SELECT clienteId, nombre FROM Clientes WHERE activo = 1 ORDER BY nombre ASC;');
    res.render('quotations/add', {productos: productos, clientes: clientes});
});

router.post('/add', isLoggedIn, IsAuthorized('addQuotations'), validateQuotations(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro preview
    if (resultadosValidacion.isEmpty()) {
        const cotizacion = req.body.data.cotizacion;
        const productos = req.body.data.productos;
        const usuarioId = req.user.usuarioId;
        const today = new Date();
        let zonaHorariaMexico = 'America/Mexico_City';
        let fechaMexico = new Date(today.toLocaleString('en-US', { timeZone: zonaHorariaMexico }));

        const newCot = {
            fecha: fechaMexico,
            cliente_id: cotizacion.cliente_id,
            proyecto: cotizacion.proyecto,
            observaciones: cotizacion.observaciones,
            porcentajeDescuento: Number(cotizacion.porcentajeDescuento),
            solicitante: cotizacion.solicitante,
            empleado: cotizacion.empleado,
            usuario_id: usuarioId,
            estatus: cotizacion.estatus,
            totalBruto: cotizacion.totalBruto,
            descuento: cotizacion.descuento,
            subtotal: cotizacion.subtotal,
            iva: cotizacion.iva,
            total: cotizacion.total
        };

        const {insertId} = await pool.query('INSERT INTO Cotizaciones SET ?;', [newCot]);
        let ProductosEnCatalogo = [];
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
                ProductosEnCatalogo.push(newProducto);
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
        console.log(ProductosEnCatalogo);
        console.log(ProductosFueraCatalogo);

        if (ProductosEnCatalogo.length > 0){
            await pool.query('INSERT INTO ProductosCotizados (cot_id, cantidad, producto_id, acabados, archivo, largo, ancho, area, precioCadaUno, monto, precio) VALUES ?;', [ProductosEnCatalogo]);
        }
        if (ProductosFueraCatalogo.length > 0){
            await pool.query('INSERT INTO FueraCatalogoCotizados (cot_id, cantidad, concepto, acabados, archivo, precio, unidad, largo, ancho, area, precioCadaUno, monto) VALUES ?;', [ProductosFueraCatalogo]);
        }

        req.flash('success', 'La cotización <b>COT-'+insertId+'</b> ha sido creada correctamente');
        res.send({url: '/quotations'});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/listProducts', isLoggedIn, validateQuotationsInfoProduct(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const productoId = req.body.idProduct;
        const producto = await pool.query('SELECT productoId, nombre, unidad, porcentaje AS descuento, precio - ROUND((porcentaje * precio) / 100, 2)  AS precio FROM Productos WHERE productoId = ?;', [productoId]);
        res.send({producto: producto[0]});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/discountClient', isLoggedIn, validateQuotationsDiscountClient(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const clienteId = req.body.clientid;
        const descuento = await pool.query('SELECT descuento FROM Clientes WHERE clienteId = ?;', [clienteId]);
        res.send({descuento: descuento[0]});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/preview', isLoggedIn, async (req, res)=>{
    const body = req.body.inputs;
    const usruarioId = req.user.usuarioId;
    const clienteId = body.clientid;
    const empleado = await pool.query('SELECT Empleados.nombreComp FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?;', [usruarioId]);
    const cliente = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?;', [clienteId]);

    // formatos de fecha
    const date = new Date();
    let zonaHorariaMexico = 'America/Mexico_City';
    let fecha = new Date(date.toLocaleString('en-CA', { timeZone: zonaHorariaMexico, year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute: 'numeric', hourCycle: 'h23' }));

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
            producto.priceach = moneda(producto.priceproduct);
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

router.get('/', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId);');
    res.render('quotations/list', {cotizaciones: cotizaciones});
})

router.get('/info/:id', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.cliente_id, Cotizaciones.proyecto, Cotizaciones.observaciones, Cotizaciones.porcentajeDescuento, Cotizaciones.solicitante, Cotizaciones.empleado, Cotizaciones.estatus, Cotizaciones.totalBruto, Cotizaciones.descuento AS descuento_cotizacion, Cotizaciones.subtotal, Cotizaciones.iva, Cotizaciones.total, Clientes.*, Empleados.nombreComp FROM Cotizaciones INNER JOIN Usuarios ON Cotizaciones.usuario_id = Usuarios.usuarioId INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

    // verificar se existe una orden para esta cotizacion
    const permitidoCancelar = await pool.query('SELECT IFNULL((SELECT IF(COUNT(Ordenes.ordenId) IS NOT NULL, 0, 1) FROM Cotizaciones INNER JOIN Ordenes ON Cotizaciones.cotId = Ordenes.cot_id WHERE Cotizaciones.cotId = ? GROUP BY Ordenes.ordenId), 1) AS permitidoCancelar;', [id]);

    // informacion para generar orden (procesos)    
    const procesosEnCatalogo = await pool.query('SELECT ProductosCotizados.prodCotizadoId AS prodCotizadoId, Productos.nombre AS producto_nombre, Procesos.procesoId AS procesoId, Procesos.nombre AS proceso_nombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden ASC) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas FROM (((((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) INNER JOIN Procesos ON Productos.proceso_id = Procesos.procesoId) INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id) INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId) WHERE Cotizaciones.cotId = ? GROUP BY prodCotizadoId;', [id]);
    const todas_areas = await pool.query('SELECT areaId, nombre FROM Areas');

    // formatear procesos (generar un arreglo con las areas para cada objeto)
    let procesosEnCatalogoArray = [];
    let procesoFormateado = {};
    let areas = [];
    let orden = [];
    procesosEnCatalogo.forEach(proceso => {
        orden = proceso.orden_areas.split(',');
        areas = proceso.areas.split(',');
        procesoFormateado = {
            producto: proceso.producto_nombre,
            procesoId: proceso.procesoId,
            proceso: proceso.proceso_nombre,
            orden: orden,
            areas: areas
        }
        procesosEnCatalogoArray.push(procesoFormateado);
        areas = [];
        orden = [];
    });

    // generar arreglo con una seriem de acuerdo al numero de areas (orden del proceso)
    let orden_posible = [];
    todas_areas.forEach((_, i) => {
        orden_posible.push(i+1);
    });

    res.render('quotations/info', {cotizacion: cotizacion[0], permitidoCancelar: permitidoCancelar[0], productos: productos, procesosEnCatalogo:procesosEnCatalogoArray, procesosFueraCatalogo:productosFueraCatalogo, areas:todas_areas, orden:orden_posible});
})

router.get('/cancel/:id', isLoggedIn, IsAuthorized('editQuotations'), async (req, res)=>{
    const {id} = req.params;

    // actualizar estatus de la cotizacion
    await pool.query('UPDATE Cotizaciones SET estatus = "Cancelada" WHERE cotId = ?', [id]);

    req.flash('success', 'La cotización <b>COT-'+id+'</b> ha sido cancelada correctamente');
    res.redirect('/quotations');
    //res.redirect('/quotations/info/' + id);
})

router.get('/edit/:id', isLoggedIn, IsAuthorized('editQuotations'), async (req,res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT * FROM Cotizaciones WHERE cotId = ?', [id]);
    const productos = await pool.query('SELECT productoId, nombre FROM Productos ORDER BY nombre ASC;');
    const clientes = await pool.query('SELECT clienteId, nombre FROM Clientes WHERE activo = 1 ORDER BY nombre ASC;');
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

router.post('/edit/:id', isLoggedIn, IsAuthorized('editQuotations'), validateQuotations(), async(req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const cotizacion = req.body.data.cotizacion;
        const productos = req.body.data.productos;
        const today = new Date();
        let zonaHorariaMexico = 'America/Mexico_City';
        let fecha = new Date(today.toLocaleString('en-US', { timeZone: zonaHorariaMexico }));

        // ordenar cotizacion
        const newCot = {
            fecha: fecha,
            cliente_id: cotizacion.cliente_id,
            proyecto: cotizacion.proyecto,
            observaciones: cotizacion.observaciones,
            porcentajeDescuento: Number(cotizacion.porcentajeDescuento),
            solicitante: cotizacion.solicitante,
            empleado: cotizacion.empleado,
            estatus: "Recotizada",
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
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/email/:id', isLoggedIn, IsAuthorized('seeListQuotations'), validateQuotationsEmialClient(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const correoCliente = req.body.inputEmailClient;
        const usruarioId = req.user.usuarioId;

        // obtener datos para generar el pdf de la cotizacion
        const cotizacion = await pool.query('SELECT Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.cliente_id, Cotizaciones.proyecto, Cotizaciones.observaciones, Cotizaciones.porcentajeDescuento, Cotizaciones.solicitante, Cotizaciones.empleado, Cotizaciones.estatus, Cotizaciones.totalBruto, Cotizaciones.descuento AS descuento_cotizacion, Cotizaciones.subtotal, Cotizaciones.iva, Cotizaciones.total, Clientes.*, Empleados.nombreComp FROM Cotizaciones INNER JOIN Usuarios ON Cotizaciones.usuario_id = Usuarios.usuarioId INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cotizaciones.cotId = ?;', [id]);
        const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
        const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
        const productos = productosEnCatalogo.concat(productosFueraCatalogo);

        // obtener datos de contacto del empleado
        const empleado = await pool.query('SELECT Empleados.nombreComp, Empleados.correoElec, Empleados.numeroCelu, Usuarios.correoElec AS usuarioCorreo, Usuarios.claveAplicacion FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?;', [usruarioId]);
        
        // generar pdf de la cotizacion
        const dataDb = {
            cotizacion: cotizacion[0],
            productos: productos
        };

        const pdfStream = Stream.PassThrough();
        
        createPdfQuotations(dataDb, (data) => {
            pdfStream.write(data)
        }, () => {
            pdfStream.end()
        });

        // compilar template del correo
        const fechaEmail = new Date().toLocaleDateString('es-mx', {year: 'numeric', month: 'numeric', day: 'numeric'});
        const sourceEmail = fs.readFileSync(path.join(process.cwd(), 'src', 'views', 'quotations', 'emailTemplate.hbs'), 'utf8');
        const templateEmail = hbs.compile(sourceEmail);
        let zonaHorariaMexico = 'America/Mexico_City';

        const contextEmail = {
            fecha: new Date().toLocaleDateString('es-mx', {timeZone: zonaHorariaMexico, year: 'numeric', month: 'long', day: 'numeric'}),
            solicitante: cotizacion[0].solicitante,
            empleado: empleado[0],
        };
        const htmlEmail = templateEmail(contextEmail);

        // crear servicio para enviar email
        const dominioCorreo = empleado[0].usuarioCorreo.split('@');
        const servicioCorreo = dominioCorreo[1].split('.');

        var transporter;
        if (servicioCorreo[0] == "gmail"){
            transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: empleado[0].usuarioCorreo,
                    pass: empleado[0].claveAplicacion
                }
            });
        } else if (servicioCorreo[0] == "outlook" || servicioCorreo[0] == "hotmail" || servicioCorreo[0] == "live"){
            transporter = nodemailer.createTransport({
                service: "Outlook",
                auth: {
                    user: empleado[0].usuarioCorreo,
                    pass: empleado[0].claveAplicacion
                }
            });
        } else{
            transporter = nodemailer.createTransport({
                service: servicioCorreo[0],
                auth: {
                    user: empleado[0].usuarioCorreo,
                    pass: empleado[0].claveAplicacion
                }
            });
        }

        // opciones del email
        const mailOptions = {
            from: empleado[0].usuarioCorreo,
            to: correoCliente,
            subject: 'PIMSA Cotización',
            html: htmlEmail,
            attachments: [{
                filename: `Cotizacion_${fechaEmail}.pdf`,
                content: pdfStream,
                contentType: 'application/pdf'
            },{
                filename: 'PIMSAlogo.png',
                path: path.join(process.cwd(), 'src', 'public', 'img', 'PIMSAlogo.png'),
                cid: 'logoPimsa'
            },{
                filename: 'facebook.png',
                path: path.join(process.cwd(), 'src', 'public', 'img', 'facebook.png'),
                cid: 'logoFacebook'
            },{
                filename: 'instagram.png',
                path: path.join(process.cwd(), 'src', 'public', 'img', 'instagram.png'),
                cid: 'logoInstagram'
            }]
        }

        // enviar email
        try {
            await transporter.sendMail(mailOptions);
            await pool.query('UPDATE Cotizaciones SET estatus = "Enviada" WHERE cotId = ?', [id]);
            req.flash('success', 'El correo electrónico a <b>'+correoCliente+'</b> ha sido enviado correctamente');
            res.redirect('/quotations/info/' + id);
        } catch (error) {
            req.flash('error', 'Ha ocurrido un error al momento de enviar el correo electrónico a <b>'+correoCliente+'</b>');
            res.redirect('/quotations/info/' + id);
        }
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/quotations/info/' + id);
    }
})

router.get('/download/:id', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.cliente_id, Cotizaciones.proyecto, Cotizaciones.observaciones, Cotizaciones.porcentajeDescuento, Cotizaciones.solicitante, Cotizaciones.empleado, Cotizaciones.estatus, Cotizaciones.totalBruto, Cotizaciones.descuento AS descuento_cotizacion, Cotizaciones.subtotal, Cotizaciones.iva, Cotizaciones.total, Clientes.*, Empleados.nombreComp FROM Cotizaciones INNER JOIN Usuarios ON Cotizaciones.usuario_id = Usuarios.usuarioId INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

    // crear objeto con la información necesaria para le pdf
    const dataDb = {
        cotizacion: cotizacion[0],
        productos: productos
    };

    // crear y enviar pdf
    const timeMilis = new Date().getTime();
    
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'content-Disposition': `attachment; filename=cot${id}_${timeMilis}.pdf`
    });
    
    createPdfQuotations(dataDb, (data) => {
        stream.write(data)
    }, () => {
        stream.end();
    });
})

router.post('/generateOrder/:id', IsAuthorized('addOrders'), validateExtaskCreateOrder(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const body = req.body;
        const usruarioId = req.user.usuarioId;
        const productosFueraCatalogoId = await pool.query('SELECT FueraCatalogoCotizados.fueraCotizadoId FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);

        if(productosFueraCatalogoId.length > 0){
            // separar los procesos dependiendo de los productos
            let j = 0;
            let procesos = {};
            let procesosArray = [];
            const valoresProcesos = Object.values(body);
            for (const key in body) {
                if (j !==0 && j%2 === 0) {
                    procesosArray.push(procesos);
                    procesos = {};
                }
                procesos[key.replace(/[0-9]/g, '')] = valoresProcesos[j];
                j++;
            }
            procesosArray.push(procesos);

            // almacenar los procesos en los productos fuera de catalogo
            let procesoId = {};
            for (let i = 0; i < productosFueraCatalogoId.length; i++) {
                procesoId = await pool.query('INSERT INTO Procesos (nombre) VALUES ("Personalizado");');
                await pool.query('UPDATE FueraCatalogoCotizados SET proceso_id = ? WHERE fueraCotizadoId = ?', [procesoId.insertId, Number(productosFueraCatalogoId[i].fueraCotizadoId)]);
                for (let j = 0; j < procesosArray[i].orderProcess.length; j++) {
                    await pool.query('INSERT INTO ProcesosOrdenes (area_id, proceso_id, orden) VALUES (?, ?, ?);', [Number(procesosArray[i].areaProcess[j]), procesoId.insertId, Number(procesosArray[i].orderProcess[j])]);
                }
                procesoId = {};
            }
        }

        // crear orden
        const date = new Date();
        let zonaHorariaMexico = 'America/Mexico_City';
        fechaGen = new Date(date.toLocaleDateString('en-CA', {timeZone: zonaHorariaMexico, year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute: 'numeric', hourCycle: 'h23'}));

        const deadline = new Date('2001-01-02');
        fechaEnt = new Date(deadline.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric'}));

        const newOrden = {
            fechaGen: fechaGen,
            fechaEnt: fechaEnt,
            cot_id: Number(id),
            usuario_id: usruarioId,
            terminada: 0,
            estatus: "Generada"
        }
        const resultadoOrden = await pool.query('INSERT INTO Ordenes SET ?;', [newOrden]);

        // asignar estatus de ordenada a la cotizacion
        await pool.query('UPDATE Cotizaciones SET estatus = "Ordenada" WHERE cotId = ?', [id]);

        req.flash('success', 'La orden <b>OT-'+resultadoOrden.insertId+'</b> ha sido creada correctamente');
        res.redirect('/orders');
        //res.redirect('/tareas/create/'+resultadoOrden.insertId);
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/quotations/info/'+id);
    }
})

module.exports = router; 
