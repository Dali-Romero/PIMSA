const express = require('express');
const hbs = require('handlebars');
const fs = require('fs');
const {Stream} = require('stream');
const path = require('path');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const { dimensiones, moneda, createPdf } = require('../lib/helpers.js');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { validateOrdersRevalue, validateOrdersPreview, validateOrdersDeadline } = require('../lib/validators.js');

const router = express.Router();

router.get('/', isLoggedIn, IsAuthorized('seeListOrders'), async (req, res)=>{
    const ordenes = await pool.query('SELECT Ordenes.ordenId, fechaGen, IF(DATE(Ordenes.fechaEnt) = DATE("2001-01-01"), "-", Ordenes.fechaEnt) AS fechaEnt, Empleados.nombreComp, Ordenes.terminada, Ordenes.estatus FROM ((Ordenes INNER JOIN Usuarios ON Ordenes.usuario_id = Usuarios.usuarioId) INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId);');
    res.render('orders/list', {ordenes: ordenes});
});

router.get('/info/:id', isLoggedIn, IsAuthorized('seeListOrders'), async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT Ordenes.ordenId, Ordenes.fechaGen, IF(DATE(Ordenes.fechaEnt) = DATE("2001-01-01"), "-", Ordenes.fechaEnt) AS fechaEnt, Ordenes.cot_id, Ordenes.terminada, Ordenes.estatus AS estatusOrden, Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.cliente_id, Cotizaciones.proyecto, Cotizaciones.observaciones, Cotizaciones.porcentajeDescuento, Cotizaciones.solicitante, Cotizaciones.empleado, Cotizaciones.estatus, Cotizaciones.totalBruto, Cotizaciones.descuento AS descuento_cotizacion, Cotizaciones.subtotal, Cotizaciones.iva, Cotizaciones.total, Clientes.*, Empleados.nombreComp FROM ((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN Usuarios ON Ordenes.usuario_id = Usuarios.usuarioId) INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId) INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE ordenId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad, Procesos.procesoId AS procesoId, Procesos.nombre AS procesoNombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden ASC, Areas.nombre ASC) AS ordenAreas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC, Areas.nombre ASC) AS areas FROM ((((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) INNER JOIN Procesos ON Productos.proceso_id = Procesos.procesoId) INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id) INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId) WHERE Ordenes.ordenId = ? GROUP BY prodCotizadoId;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.*, Procesos.procesoId AS procesoId, Procesos.nombre AS procesoNombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden ASC, Areas.nombre ASC) AS ordenAreas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC, Areas.nombre ASC) AS areas FROM (((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) INNER JOIN Procesos ON FueraCatalogoCotizados.proceso_id = Procesos.procesoId) INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id) INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId) WHERE Ordenes.ordenId = ? GROUP BY fueraCotizadoId;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

    // verificar se existen tareas para esta cotizacion
    const permitidoCancelar = await pool.query('SELECT IFNULL((SELECT IF(COUNT(Tareas.tareaId) IS NOT NULL, 0, 1) FROM Tareas INNER JOIN TareasOrden ON Tareas.tareaorden_id = TareasOrden.tareaOrdenId INNER JOIN Ordenes ON TareasOrden.orden_id = Ordenes.ordenId WHERE Ordenes.ordenId = ? GROUP BY Ordenes.ordenId), 1) AS permitidoCancelar;', [id]);
    
    // separar las areas y su orden
    productos.forEach(producto => {
        producto.ordenAreas = producto.ordenAreas.split(',');
        producto.areas = producto.areas.split(',');
    });

    // fecha minima de entrega
    date = new Date();
    let zonaHorariaMexico = 'America/Mexico_City';
    fechaMin = date.toLocaleDateString('en-CA', {timeZone: zonaHorariaMexico, year: 'numeric', month: 'numeric', day: 'numeric'});
    
    res.render('orders/info', {cotizacion: cotizacion[0], productos: productos, permitidoCancelar: permitidoCancelar[0], fechaMinima: fechaMin});
});

router.get('/cancel/:id', isLoggedIn, IsAuthorized('editOrders'), async (req, res)=> {
    const {id} = req.params;
    const cotId = await pool.query('SELECT Cotizaciones.cotId FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Ordenes.ordenId = ?;', [id]);

    // actualizar estatus de la orden
    await pool.query('UPDATE Ordenes SET estatus = "Cancelada" WHERE ordenId = ?;', [id]);
    
    // actualizar estatus de la cotización
    await pool.query('UPDATE Cotizaciones SET estatus = "Orden cancelada" WHERE cotId = ?;', [cotId[0].cotId]);

    req.flash('success', 'La orden <b>OT-'+id+'</b> ha sido cancelada correctamente');
    res.redirect('/orders');
})

router.get('/download/:id', isLoggedIn, IsAuthorized('seeListOrders'), async (req, res)=>{
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT Ordenes.ordenId, Ordenes.fechaGen, IF(DATE(Ordenes.fechaGen) = Ordenes.fechaEnt, "-", Ordenes.fechaEnt) AS fechaEnt, Ordenes.cot_id, Ordenes.terminada, Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.cliente_id, Cotizaciones.proyecto, Cotizaciones.observaciones, Cotizaciones.porcentajeDescuento, Cotizaciones.solicitante, Cotizaciones.empleado, Cotizaciones.estatus, Cotizaciones.totalBruto, Cotizaciones.descuento AS descuento_cotizacion, Cotizaciones.subtotal, Cotizaciones.iva, Cotizaciones.total, Clientes.*, Empleados.nombreComp FROM ((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN Usuarios ON Ordenes.usuario_id = Usuarios.usuarioId) INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId) INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE ordenId = ?;', [id]);
    const productosEnCatalogo = await pool.query('SELECT ProductosCotizados.*, Productos.nombre, Productos.unidad, Procesos.procesoId AS procesoId, Procesos.nombre AS procesoNombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden ASC) AS ordenAreas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas FROM ((((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) INNER JOIN Procesos ON Productos.proceso_id = Procesos.procesoId) INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id) INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId) WHERE Ordenes.ordenId = ? GROUP BY prodCotizadoId;', [id]);
    const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.*, Procesos.procesoId AS procesoId, Procesos.nombre AS procesoNombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden ASC) AS ordenAreas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas FROM (((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) INNER JOIN Procesos ON FueraCatalogoCotizados.proceso_id = Procesos.procesoId) INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id) INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId) WHERE Ordenes.ordenId = ? GROUP BY fueraCotizadoId;', [id]);
    const productos = productosEnCatalogo.concat(productosFueraCatalogo);

    // separar las areas y su orden
    productos.forEach(producto => {
        producto.ordenAreas = producto.ordenAreas.split(',');
        producto.areas = producto.areas.split(',');
    });

    // leer imagen del logo
    const bitMap = fs.readFileSync(path.join(process.cwd(), 'src', 'public', 'img', 'PIMSAlogo.png'));
    const buffer = Buffer.from(bitMap).toString('base64');
    const imgSrc = `data:image/png;base64,${buffer}`;

    // compilar template para el archivo pdf
    const source = fs.readFileSync(path.join(process.cwd(), 'src', 'views', 'orders', 'pdfTemplate.hbs'), 'utf8');
    const template = hbs.compile(source);
    const context = {
        pimsaLogo: imgSrc,
        cotizacion: cotizacion[0],
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
    res.attachment(`ot${id}_${timeMilis}.pdf`);
    res.contentType('application/pdf');
    readStream.pipe(res).on('error', function(e){console.error(e)});
})

router.get('/revalue/:id', isLoggedIn, IsAuthorized('editOrders'), async (req, res)=> {
    const {id} = req.params;
    const cotizacion = await pool.query('SELECT Ordenes.ordenId, Cotizaciones.*, Clientes.clienteId, Clientes.nombre, Clientes.descuento AS maxDescuento FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Ordenes.ordenId = ?;', [id]);
    const productos = await pool.query('SELECT Productos.* FROM ((SELECT Ordenes.ordenId AS ordenId, ProductosCotizados.prodCotizadoId AS prodCotizadoId, Productos.nombre AS nombre, Productos.unidad AS unidad, Productos.precio AS precio, ProductosCotizados.cantidad AS cantidad, ProductosCotizados.acabados AS acabados, ProductosCotizados.archivo AS archivo, ProductosCotizados.largo AS largo, ProductosCotizados.ancho AS ancho, 0 AS fueraCatalogo FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) UNION ALL (SELECT Ordenes.ordenId AS ordenId, FueraCatalogoCotizados.fueraCotizadoId AS prodCotizadoId, FueraCatalogoCotizados.concepto AS nombre, FueraCatalogoCotizados.unidad AS unidad, FueraCatalogoCotizados.precio AS precio, FueraCatalogoCotizados.cantidad AS cantidad, FueraCatalogoCotizados.acabados AS acabados, FueraCatalogoCotizados.archivo AS archivo, FueraCatalogoCotizados.largo AS largo, FueraCatalogoCotizados.ancho AS ancho, 1 AS fueraCatalogo FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id)) AS Productos WHERE Productos.ordenId = ?;', [id]);
    res.render('orders/revalue', {cotizacion: cotizacion[0], productos: productos});
})

router.post('/revalue/:id', isLoggedIn, IsAuthorized('editOrders'), validateOrdersRevalue(), async (req, res)=> {
    const {id} = req.params;
    
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const cotizacion = req.body.data.cotizacion;
        const productos = req.body.data.productos;

        // obtener id de la cotizacion relacionada con esta orden
        const cotId = await pool.query('SELECT Cotizaciones.cotId AS cotId FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Ordenes.ordenId = ?;', [id]);

        // ordenar cotizacion
        const newCot = {
            observaciones: cotizacion.observaciones,
            porcentajeDescuento: Number(cotizacion.porcentajeDescuento),
            totalBruto: cotizacion.totalBruto,
            descuento: cotizacion.descuento,
            subtotal: cotizacion.subtotal,
            iva: cotizacion.iva,
            total: cotizacion.total
        };

        // actualizar cotizacion
        await pool.query('UPDATE Cotizaciones SET ? WHERE cotId = ?', [newCot, cotId[0].cotId]);

        // ordenar productos
        let todosProductos = []
        let newProducto = [];
        productos.forEach(producto => {
            newProducto = [
                Number(producto.revalueproductId),
                Number(producto.revaluepriceproduct),
                producto.revaluepriceach,
                producto.revalueamount,
                producto.revalueisoutcatalog
            ]
            todosProductos.push(newProducto);
            newProducto = [];
        });

        // agregar nuevos productos cotizados
        if (todosProductos.length > 0){
            for await (const producto of productos) {
                if (producto.revalueisoutcatalog == '0') {
                    await pool.query('UPDATE ProductosCotizados SET  precio = ?, precioCadaUno = ?, monto = ? WHERE prodCotizadoId = ?;', [producto.revaluepriceproduct, producto.revaluepriceach, producto.revalueamount, producto.revalueproductId]);
                } else {
                    await pool.query('UPDATE FueraCatalogoCotizados SET precio = ?, precioCadaUno = ?, monto = ? WHERE fueraCotizadoId = ?;', [producto.revaluepriceproduct, producto.revaluepriceach, producto.revalueamount, producto.revalueproductId]);
                }
            }
        }

        // actualizar estatus de la orden
        await pool.query('UPDATE Ordenes SET estatus = "Revaluada" WHERE ordenId = ?;', [id]);

        req.flash('success', 'La orden <b>OT-'+id+'</b> ha sido revaluada correctamente');
        res.send({url: '/orders'});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/preview', isLoggedIn, validateOrdersPreview(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const body = req.body.inputs;
        const orderId = body.revalueorderid;
        const cotizacion = await pool.query('SELECT Cotizaciones.* FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Ordenes.ordenId = ?;', [orderId]);
        const empleado = await pool.query('SELECT Cotizaciones.empleado FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Ordenes.ordenId = ?;', [orderId]);
        const cliente = await pool.query('SELECT Clientes.* FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Ordenes.ordenId = ?;', [orderId]);

        // obtener informacion de los productos 
        let i = 0;
        const productos = {};
        const valoresBody = Object.values(body);
        for (const key in body) {
            if (i>4) {
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
        if(producto.revalueunitproduct === 'Mt'){
            producto.revaluemeasure = dimensiones(producto.revaluelengthproduct * producto.revaluewidthproduct);
            producto.revaluepriceach = moneda(producto.revaluemeasure * producto.revaluepriceproduct);
            producto.revalueamount = moneda(producto.revaluepriceach * producto.revaluequantityproduct);
        }else{
            producto.revaluemeasure = dimensiones(producto.revaluelengthproduct * producto.revaluewidthproduct);
            producto.revaluepriceach = moneda(producto.revaluepriceproduct);
            producto.revalueamount = moneda(producto.revaluepriceproduct * producto.revaluequantityproduct);
            }
            bruto = bruto + producto.revalueamount;
            bruto = moneda(bruto);
        });
        descuento = moneda((body.revaluenumdiscount*bruto)/100);
        subtotal = moneda(bruto-descuento);
        iva = moneda((16*subtotal)/100);
        total = moneda(subtotal + iva);

        // ajustar cotizacion
        const cot = {
            fecha: cotizacion[0].fecha,
            cliente_id: cotizacion[0].cliente_id,
            solicitante: cotizacion[0].solicitante,
            proyecto: cotizacion[0].proyecto,
            observaciones: cotizacion[0].observaciones,
            empleado: empleado[0].empleado,
            estatus: cotizacion[0].estatus,
            totalBruto: bruto,
            porcentajeDescuento: body.revaluenumdiscount,
            descuento: descuento,
            subtotal: subtotal,
            iva: iva,
            total:total
        }

        res.send({cotizacion:cot, cliente: cliente[0], productos: productosCotArray});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/addDeadline/:id', isLoggedIn, IsAuthorized('editOrders'), validateOrdersDeadline(), async (req, res) => {
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const fechaEnt = req.body.deadline;
        
        // actualizar fecha de entrega en la orden
        await pool.query('UPDATE Ordenes SET fechaEnt = ?, estatus = "En proceso" WHERE ordenId = ?;', [fechaEnt, id]);

        // redirigir a crear tareas
        res.redirect('/tareas/create/'+id);
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/orders/info/'+id);
    }
})

module.exports = router;