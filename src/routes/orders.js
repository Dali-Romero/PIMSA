const express = require('express');
const hbs = require('handlebars');
const fs = require('fs');
const {Stream} = require('stream');
const path = require('path');
const pool = require('../database.js');
const { createPdf } = require('../lib/helpers.js');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');

const router = express.Router();

router.get('/', isLoggedIn, IsAuthorized('seeListOrders'), async (req, res)=>{
    const ordenes = await pool.query('SELECT Ordenes.ordenId, fechaGen, IF(DATE(Ordenes.fechaGen) = Ordenes.fechaEnt, "-", Ordenes.fechaEnt) AS fechaEnt, Empleados.nombreComp, Ordenes.terminada FROM ((Ordenes INNER JOIN Usuarios ON Ordenes.usuario_id = Usuarios.usuarioId) INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId);');
    res.render('orders/list', {ordenes: ordenes});
});

router.get('/info/:id', isLoggedIn, IsAuthorized('seeListOrders'), async (req, res)=>{
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
    
    res.render('orders/info', {cotizacion: cotizacion[0], productos: productos});
});

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

module.exports = router;