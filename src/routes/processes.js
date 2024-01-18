const express = require('express');
const pool = require('../database.js');
const {isLoggedIn} = require('../lib/auth.js');

const router = express.Router();

router.get('/add', isLoggedIn, async (req, res) => {
    const areas = await pool.query('SELECT areaId, nombre FROM Areas');

    // generar arreglo con una serie de acuerdo al numero de areas (orden del proceso)
    let orden_posible = [];
    areas.forEach((_, i) => {
        orden_posible.push(i+1);
    });

    res.render('processes/add', {areas: areas, orden: orden_posible});
})

router.post('/add', isLoggedIn, async (req, res) => {
    const proceso = req.body;
    
    // almacenar nuevo proceso
    const {insertId} = await pool.query('INSERT INTO Procesos (nombre) VALUES (?);', [proceso.processname]);

    // organizar el orden de los procesos para su almacenamiento
    let procesosOrden = [];
    for (let i = 0; i < proceso.orderProcess.length; i++) {
        procesosOrden.push([Number(proceso.areaProcess[i]), insertId, Number(proceso.orderProcess[i])]);
    }

    // almacenar los procesos en procesosOrdenes
    await pool.query('INSERT INTO ProcesosOrdenes (area_id, proceso_id, orden) VALUES ?;', [procesosOrden]);

    req.flash('success', 'El proceso <b>'+proceso.processname+'</b> ha sido creado correctamente');
    res.redirect('/processes');
})

router.get('/', isLoggedIn, async (req, res) => {
    //const procesos =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, COUNT(ProcesosOrdenes.orden) AS total_areas, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas, total_productos.total AS total_productos FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId INNER JOIN (SELECT Procesos.procesoId AS proceso_id, COUNT(Productos.productoId) AS total FROM Procesos LEFT JOIN Productos ON Procesos.procesoId = Productos.proceso_id GROUP BY Procesos.procesoId) AS total_productos ON Procesos.procesoId = total_productos.proceso_id GROUP BY Procesos.procesoId;');
    const procesos =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, COUNT(ProcesosOrdenes.orden) AS total_areas, total_productos.total AS total_productos FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId INNER JOIN (SELECT Procesos.procesoId AS proceso_id, COUNT(Productos.productoId) AS total FROM Procesos LEFT JOIN Productos ON Procesos.procesoId = Productos.proceso_id GROUP BY Procesos.procesoId) AS total_productos ON Procesos.procesoId = total_productos.proceso_id WHERE Procesos.nombre <> "Personalizado" GROUP BY Procesos.procesoId;');
    res.render('processes/list', {procesos: procesos});
})

router.post('/listStages', isLoggedIn, async (req, res) => {
    const procesoId = req.body.proccessId;
    const proceso =  await pool.query('SELECT Procesos.nombre AS proceso_nombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS proceso_areas FROM ((Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId)) WHERE Procesos.procesoId = ? GROUP BY Procesos.procesoId;', [procesoId]);
    const procesoNombre = await pool.query('SELECT nombre FROM Procesos WHERE procesoId = ?;', [procesoId])

    // ajustar la estructura de los datos
    let etapas = [];
    let etapa = {};
    const valoresOrden = Object.values(proceso[0].orden_areas.split(','));
    const valoresAreas = Object.values(proceso[0].proceso_areas.split(','));
    for (let i = 0; i < valoresOrden.length; i++) {
        etapa = {
            orden: valoresOrden[i],
            area: valoresAreas[i],
        }
        etapas.push(etapa);
        etapa = {};
    }

    // crear nuevo objeto con el proceso ya formateado
    const procesoEstructurado = {
        proceso_nombre: proceso[0].proceso_nombre,
        etapas: etapas
    }
    
    //res.send({etapas: etapas[0], procesoNombre: procesoNombre[0]});
    res.send({proceso: procesoEstructurado});
})

router.post('/listProducts', isLoggedIn, async (req, res) => {
    const procesoId = req.body.processId;
    const productos =  await pool.query('SELECT Productos.nombre AS producto_nombre FROM Procesos INNER JOIN Productos ON Procesos.procesoId = Productos.proceso_id WHERE Procesos.procesoId = ?;', [procesoId]);
    const proceso = await pool.query('SELECT nombre FROM Procesos WHERE procesoId = ?;', [procesoId]);
    res.send({productos: productos, proceso: proceso[0]});
})

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const proceso =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS proceso_areas FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId WHERE Procesos.ProcesoId = ? GROUP BY Procesos.procesoId;', [id]);
    const areas = await pool.query('SELECT areaId, nombre FROM Areas');

    // ajustar la estructura de los datos
    let etapas = [];
    let etapa = {};
    const valoresOrden = Object.values(proceso[0].orden_areas.split(','));
    const valoresAreas = Object.values(proceso[0].proceso_areas.split(','));
    for (let i = 0; i < valoresOrden.length; i++) {
        etapa = {
            orden: valoresOrden[i],
            area: valoresAreas[i],
        }
        etapas.push(etapa);
        etapa = {};
    }

    // crear nuevo objeto con el proceso ya formateado
    const procesoEstructurado = {
        proceso_id: proceso[0].proceso_id,
        proceso_nombre: proceso[0].proceso_nombre,
        etapas: etapas
    }

    // generar arreglo con una serie de acuerdo al numero de areas (orden del proceso)
    let ordenPosible = [];
    areas.forEach((_, i) => {
        ordenPosible.push(i+1);
    });

    res.render('processes/edit', {proceso: procesoEstructurado, areas: areas, orden: ordenPosible});
})

router.post('/edit/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const proceso = req.body;
    
    // actualizar proceso
    await pool.query('UPDATE Procesos SET nombre = ? WHERE procesoId = ?', [proceso.processname, id])

    // eliminar y volver a añadir los permisos
    let procesosOrden = [];
    if (proceso !== undefined){
        await pool.query('DELETE FROM ProcesosOrdenes WHERE proceso_id = ?', [id]);
        for (let i = 0; i < proceso.orderProcess.length; i++) {
            procesosOrden.push([Number(proceso.areaProcess[i]), id, Number(proceso.orderProcess[i])]);
        }
        await pool.query('INSERT INTO ProcesosOrdenes (area_id, proceso_id, orden) VALUES ?;', [procesosOrden]);
    }

    req.flash('success', 'El proceso <b>'+proceso.processname+'</b> ha sido editado correctamente');
    res.redirect('/processes');
})

module.exports = router;