const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
    const ordenes = await pool.query('SELECT Ordenes.ordenId, Ordenes.fechaGen, Ordenes.fechaEnt, GROUP_CONCAT(DISTINCT CONCAT(tareasorden.tareaOrdenId, "-", ProductosJuntos.productoNombre) ORDER BY tareasorden.tareaOrdenId) AS producto, COUNT(IF(Tareas.terminada = 1, 1, NULL)) AS tareasTerminadas, COUNT(Tareas.tareaId) AS totalTareas, Cotizaciones.empleado FROM Tareas INNER JOIN tareasorden ON Tareas.tareaorden_id = tareasorden.tareaOrdenId INNER JOIN Ordenes ON tareasorden.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN ((SELECT Ordenes.ordenId AS orden_id, Productos.productoId AS productoId, Productos.nombre AS productoNombre, 0 AS fueraCatalogo FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) UNION ALL (SELECT Ordenes.ordenId AS orden_id, FueraCatalogoCotizados.fueraCotizadoId AS productoId, FueraCatalogoCotizados.concepto AS productoNombre, 1 AS fueraCatalogo FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id)) AS ProductosJuntos ON Ordenes.ordenId = ProductosJuntos.orden_id AND tareasorden.fueracatalogo = ProductosJuntos.fueraCatalogo AND tareasorden.cotizadoId = ProductosJuntos.productoId GROUP BY Ordenes.ordenId;');
    
    // ajustar estructura de los productos
    let ordenesEstructuradas = [];
    let productosPorOrden = [];
    let ordenEstructurada = {};
    ordenes.forEach(orden => {
        // obtener un arreglo con todos los productos de la orden (id-nombre)
        let productos = orden.producto.split(',');

        // recorrer todos los productos de una orden por una orden
        productos.forEach(producto => {
            // obtener la informacion de cadaproducto (id y nombre)
            let infoProducto = producto.split('-');
            producto = {
                idTarea: infoProducto[0],
                nombre: infoProducto[1]
            }

            // almacenar la informacion divida en un arreglo
            productosPorOrden.push(producto)

            // limpiar las estrucuturas
            producto = {};
        })

        // crear un obajeto por cada orden, la cual contendra un arreglo con la informcacion de sus productos productos: [{id, nombre}, {id, nombre} ...]
        ordenEstructurada = {
            ordenId: orden.ordenId,
            fechaGen: orden.fechaGen,
            fechaEnt: orden.fechaEnt,
            productos: productosPorOrden,
            tareasTerminadas: orden.tareasTerminadas,
            totalTareas: orden.totalTareas,
            empleado: orden.empleado
        }

        // almacenar las ordenes ya estructuradas en un arreglo
        ordenesEstructuradas.push(ordenEstructurada);

        // limpiar las estrucuturas
        productosPorOrden = [];
        ordenEstructurada = {};
    });

    res.render('monitor/monitor', {ordenes: ordenesEstructuradas});
})

router.post('/infoTask', isLoggedIn, async (req, res) => {
    const idTarea = req.body.taskId;
    const productoNombre = await pool.query('SELECT DISTINCT ProductosJuntos.productoNombre FROM Tareas INNER JOIN tareasorden ON Tareas.tareaorden_id = tareasorden.tareaOrdenId INNER JOIN Ordenes ON tareasorden.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN ((SELECT Ordenes.ordenId AS orden_id, Productos.productoId AS productoId, Productos.nombre AS productoNombre, 0 AS fueraCatalogo FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) UNION ALL (SELECT Ordenes.ordenId AS orden_id, FueraCatalogoCotizados.fueraCotizadoId AS productoId, FueraCatalogoCotizados.concepto AS productoNombre, 1 AS fueraCatalogo FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id)) AS ProductosJuntos ON Ordenes.ordenId = ProductosJuntos.orden_id AND tareasorden.fueracatalogo = ProductosJuntos.fueraCatalogo AND tareasorden.cotizadoId = ProductosJuntos.productoId WHERE tareasorden.tareaOrdenId = ?;', [idTarea]);
    const tareas = await pool.query('SELECT IFNULL(CONCAT(Usuarios.nombre, " ", Usuarios.apellido), "Sin asignar") AS encargado, IFNULL(Areas.nombre, "Sin asignar") AS areaNombre, IFNULL(Maquinas.nombre, "Sin asignar") AS maquinaNombre, Tareas.terminada AS tareaTerminada, Tareas.nombre AS tareaNombre, Tareas.check AS tareaCheck, Tareas.activa AS tareaActiva, Tareas.sucesion AS tareaSucesion, IFNULL(Tareas.notes, "Sin notas") AS tareaNotas FROM tareasorden INNER JOIN Tareas ON tareasorden.tareaOrdenId = Tareas.tareaorden_id LEFT JOIN Usuarios ON Tareas.usuario_id = Usuarios.usuarioId LEFT JOIN Areas ON Tareas.area_id = Areas.areaId LEFT JOIN Maquinas ON Tareas.maquina_id = Maquinas.maquinaId WHERE tareasorden.tareaOrdenId = ?;', [idTarea]);
    
    // añadir un indice a las tareas (enumerarlas)
    tareas.forEach((tarea, i) => {
        tarea.tareaIndice = i + 1;
    })

    // obtener las tareas que se realizan de forma asincrona por tarea (buscar repetidos)
    let tareasRepetidas = '';
    for (let i = 0; i < tareas.length; i++) {
        let tareaSucesion = tareas[i].tareaSucesion;
        for (let j = 0; j < tareas.length; j++) {
            if(tareas[j].tareaSucesion === tareaSucesion && j !== i){
                tareasRepetidas += `Tarea ${tareas[j].tareaIndice}, `
            }
        }
        if(tareasRepetidas.length > 0){
            tareas[i].tareasSincronas = tareasRepetidas;
            tareasRepetidas = '';
        } else{
            tareas[i].tareasSincronas = 'Asíncrona';
        }
    }

    // eliminar ultima coma y espacio en blanco
    tareas.forEach(tarea => {
        tarea.tareasSincronas = tarea.tareasSincronas.replace(/,\s$/, '')
    });

    res.send({producto: productoNombre[0], tareas: tareas});
})

module.exports = router;