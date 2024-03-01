const express = require('express');
const hbs = require('handlebars');
const fs = require('fs');
const {Stream} = require('stream');
const path = require('path');
const nodemailer = require('nodemailer');
const pool = require('../database.js');
const {moneda, dimensiones, createPdf} = require('../lib/helpers.js');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
require('../lib/handlebars.js');

const router = express.Router();

router.get('/add', isLoggedIn, IsAuthorized('addQuotations'), async (req, res)=>{
    const productos = await pool.query('SELECT productoId, nombre FROM Productos ORDER BY nombre ASC;');
    const clientes = await pool.query('SELECT clienteId, nombre FROM Clientes ORDER BY nombre ASC;');
    res.render('quotations/add', {productos: productos, clientes: clientes});
});

router.post('/add', isLoggedIn, IsAuthorized('addQuotations'), async (req, res)=>{
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

router.get('/', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId);');
    res.render('quotations/list', {cotizaciones: cotizaciones});
})

router.get('/info/:id', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT * FROM Cotizaciones WHERE cotId = ?', [id]);
    const cliente = await pool.query('SELECT * FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

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

    res.render('quotations/info', {cotizacion: cotizacion[0], cliente: cliente[0], productos: productos, procesosEnCatalogo:procesosEnCatalogoArray, procesosFueraCatalogo:productosFueraCatalogo, areas:todas_areas, orden:orden_posible});
})

router.get('/cancel/:id', isLoggedIn, IsAuthorized('editQuotations'), async (req, res)=>{
    const {id} = req.params;
    await pool.query('UPDATE Cotizaciones SET estatus = "Cancelada" WHERE cotId = ?', [id]);
    res.redirect('/quotations/info/' + id);
})

router.get('/edit/:id', isLoggedIn, IsAuthorized('editQuotations'), async (req,res)=>{
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

router.post('/edit/:id', isLoggedIn, IsAuthorized('editQuotations'), async(req, res)=>{
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

router.post('/email/:id', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
    const {id} = req.params;
    const correoCliente = req.body.inputEmailClient;
    const usruarioId = req.user.usuarioId;

    // obtener datos para generar el pdf de la cotizacion
    const cotizacion = await pool.query('SELECT * FROM Cotizaciones WHERE cotId = ?', [id]);
    const cliente = await pool.query('SELECT * FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad FROM ((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) WHERE Cotizaciones.cotId = ?;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

    // obtener datos de contacto del empleado
    const empleado = await pool.query('SELECT Empleados.nombreComp, Empleados.correoElec, Empleados.numeroCelu FROM (Empleados INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) WHERE Usuarios.usuarioId = ?;', [usruarioId]);

    // leer imagen del logo
    const bitMap = fs.readFileSync(path.join(process.cwd(), 'src', 'public', 'img', 'PIMSAlogo.png'));
    const buffer = Buffer.from(bitMap).toString('base64');
    const imgSrc = `data:image/png;base64,${buffer}`;

    // generar pdf de la cotizacion
    const sourcePdf = fs.readFileSync(path.join(process.cwd(), 'src', 'views', 'quotations', 'pdfTemplate.hbs'), 'utf8');
    const templatePdf = hbs.compile(sourcePdf);
    const contextPdf = {
        pimsaLogo: imgSrc,
        cotizacion: cotizacion[0],
        cliente: cliente[0],
        productos: productos
    };
    const htmlPdf = templatePdf(contextPdf);
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
    };
    const pdf = await createPdf(htmlPdf, options);
    readStream.end(pdf);

    // compilar template del correo
    const fechaEmail = new Date().toLocaleDateString('es-mx', {year: 'numeric', month: 'numeric', day: 'numeric'});
    const sourceEmail = fs.readFileSync(path.join(process.cwd(), 'src', 'views', 'quotations', 'emailTemplate.hbs'), 'utf8');
    const templateEmail = hbs.compile(sourceEmail);
    const contextEmail = {
        fecha: new Date().toLocaleDateString('es-mx', {year: 'numeric', month: 'long', day: 'numeric'}),
        solicitante: cotizacion[0].solicitante,
        empleado: empleado[0],
    };
    const htmlEmail = templateEmail(contextEmail);

    // crear servicio para enviar email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hagantyr@gmail.com',
            pass: 'ollzhyjewlbpnaye'
        }
    });

    // opciones del email
    const mailOptions = {
        from: 'hagantyr@gmail.com',
        to: correoCliente,
        subject: 'PIMSA Cotización',
        html: htmlEmail,
        attachments: [{
            filename: `Cotizacion_${fechaEmail}.pdf`,
            content: pdf,
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
})

router.get('/download/:id', isLoggedIn, IsAuthorized('seeListQuotations'), async (req, res)=>{
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

router.post('/generateOrder/:id', IsAuthorized('addOrders'), async (req, res)=>{
    const {id} = req.params;
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

        // generar nuevo proceso para cada producto fuera de catalogo
        let newProcesos = [];
        procesosArray.forEach((element, i) => {
            newProcesos.push([
                'Personalizado'
            ])
        });

        // almacenar n procesos personalizados
        const resultadoProcesos = await pool.query('INSERT INTO Procesos (nombre) VALUES ?;', [newProcesos]);

        // almacenar los procesos en los productos fuera de catalogo
        productosFueraCatalogoId.forEach(async (productoId, i) => {
            await pool.query('UPDATE FueraCatalogoCotizados SET proceso_id = ? WHERE fueraCotizadoId = ?', [resultadoProcesos.insertId + i, Number(productoId.fueraCotizadoId)]);
        });

        // organizar los procesos para su almacenamiento
        let procesosOrden = [];
        procesosArray.forEach((producto, i) => {
            for (let j = 0; j < producto.orderProcess.length; j++) {
                procesosOrden.push([Number(producto.areaProcess[j]), resultadoProcesos.insertId + i, Number(producto.orderProcess[j])]);
            }
        });

        // almacenar los procesos en procesosOrdenes
        await pool.query('INSERT INTO ProcesosOrdenes (area_id, proceso_id, orden) VALUES ?;', [procesosOrden]);
    }

    // crear orden
    const date = new Date();
    fechaGen = date.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute: 'numeric', hour12: false});
    fechaEnt = date.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric'});

    const newOrden = {
        fechaGen: fechaGen,
        fechaEnt: fechaEnt,
        cot_id: Number(id),
        usuario_id: usruarioId,
        terminada: 0
    }
    const resultadoOrden = await pool.query('INSERT INTO Ordenes SET ?;', [newOrden]);

    // asignar estatus de ordenada a la cotizacion
    await pool.query('UPDATE Cotizaciones SET estatus = "Ordenada" WHERE cotId = ?', [id]);

    req.flash('success', 'La orden <b>OT-'+resultadoOrden.insertId+'</b> ha sido creada correctamente');
    res.redirect('/tareas/create/'+resultadoOrden.insertId);
})

module.exports = router; 