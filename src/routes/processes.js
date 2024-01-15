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

router.get('/', isLoggedIn, async (req, res) => {
    //const procesos =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, COUNT(ProcesosOrdenes.orden) AS total_areas, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas, total_productos.total AS total_productos FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId INNER JOIN (SELECT Procesos.procesoId AS proceso_id, COUNT(Productos.productoId) AS total FROM Procesos LEFT JOIN Productos ON Procesos.procesoId = Productos.proceso_id GROUP BY Procesos.procesoId) AS total_productos ON Procesos.procesoId = total_productos.proceso_id GROUP BY Procesos.procesoId;');
    const procesos =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, COUNT(ProcesosOrdenes.orden) AS total_areas, total_productos.total AS total_productos FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId INNER JOIN (SELECT Procesos.procesoId AS proceso_id, COUNT(Productos.productoId) AS total FROM Procesos LEFT JOIN Productos ON Procesos.procesoId = Productos.proceso_id GROUP BY Procesos.procesoId) AS total_productos ON Procesos.procesoId = total_productos.proceso_id WHERE Procesos.nombre <> "Personalizado" GROUP BY Procesos.procesoId;');

    res.render('processes/list', {procesos: procesos});
})

router.post('/listStages', isLoggedIn, async (req, res) => {
    const procesoId = req.body.proccessId;
    const etapas =  await pool.query('SELECT Procesos.nombre AS proceso_nombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas FROM ((Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId)) WHERE Procesos.procesoId = ? GROUP BY Procesos.procesoId;', [procesoId]);
    const proceso = await pool.query('SELECT nombre FROM Procesos WHERE procesoId = ?;', [procesoId])
    
    // separar el orden de las areas y las areas
    etapas[0].orden_areas = etapas[0].orden_areas.split(',');
    etapas[0].areas = etapas[0].areas.split(',');
    
    res.send({etapas: etapas[0], proceso: proceso[0]});
})

router.post('/listProducts', isLoggedIn, async (req, res) => {
    const procesoId = req.body.processId;
    const productos =  await pool.query('SELECT Productos.nombre AS producto_nombre FROM Procesos INNER JOIN Productos ON Procesos.procesoId = Productos.proceso_id WHERE Procesos.procesoId = ?;', [procesoId]);
    const proceso = await pool.query('SELECT nombre FROM Procesos WHERE procesoId = ?;', [procesoId]);
    res.send({productos: productos, proceso: proceso[0]});
})

module.exports = router;