const express = require('express');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { validateProcesses, validateProcessesLists } = require('../lib/validators.js');

const router = express.Router();

router.get('/add', isLoggedIn, IsAuthorized('addProcesses'), async (req, res) => {
    const areas = await pool.query('SELECT areaId, nombre FROM Areas WHERE nombre != "VENTAS" AND nombre != "COBRANZA"');

    // generar un arreglo con una serie dependiendo del número de areas (orden del proceso)
    let orden_posible = [];
    areas.forEach((_, i) => {
        orden_posible.push(i+1);
    });

    res.render('processes/add', {areas: areas, orden: orden_posible});
})

router.post('/add', isLoggedIn, IsAuthorized('addProcesses'), validateProcesses(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const proceso = req.body;

        // almacenar nuevo proceso
        const {insertId} = await pool.query('INSERT INTO Procesos (nombre, descripcion) VALUES (?, ?);', [proceso.processname, proceso.processdescription]);

        // organizar el orden de los procesos para su almacenamiento
        let procesosOrden = [];
        for (let i = 0; i < proceso.orderProcess.length; i++) {
            procesosOrden.push([Number(proceso.areaProcess[i]), insertId, Number(proceso.orderProcess[i])]);
        }

        // almacenar los procesos en procesosOrdenes
        await pool.query('INSERT INTO ProcesosOrdenes (area_id, proceso_id, orden) VALUES ?;', [procesosOrden]);

        req.flash('success', 'El proceso <b>'+proceso.processname+'</b> ha sido creado correctamente');
        res.redirect('/processes');
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/processes/add');
    }
})

router.get('/', isLoggedIn, IsAuthorized('seeListProcesses'), async (req, res) => {
    const procesos =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, IFNULL(Procesos.descripcion, "Sin descripción") AS proceso_descripcion, COUNT(ProcesosOrdenes.orden) AS total_areas, total_productos.total AS total_productos FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId INNER JOIN (SELECT Procesos.procesoId AS proceso_id, COUNT(Productos.productoId) AS total FROM Procesos LEFT JOIN Productos ON Procesos.procesoId = Productos.proceso_id GROUP BY Procesos.procesoId) AS total_productos ON Procesos.procesoId = total_productos.proceso_id WHERE Procesos.nombre <> "Personalizado" GROUP BY Procesos.procesoId;');
    res.render('processes/list', {procesos: procesos});
})

router.post('/listStages', isLoggedIn, IsAuthorized('seeListProcesses'), validateProcessesLists(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const procesoId = req.body.processId;
        const proceso =  await pool.query('SELECT Procesos.nombre AS proceso_nombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS proceso_areas, GROUP_CONCAT(IFNULL(Areas.descripcion, "Sin descripción") ORDER BY ProcesosOrdenes.orden ASC SEPARATOR "&") AS desc_areas FROM ((Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId)) WHERE Procesos.procesoId = ? GROUP BY Procesos.procesoId;', [procesoId]);

        // ajustar la estructura de los datos
        let etapas = [];
        let etapa = {};
        let maxOrden = 0;
        const valoresOrden = Object.values(proceso[0].orden_areas.split(','));
        const valoresAreas = Object.values(proceso[0].proceso_areas.split(','));
        const descAreas = Object.values(proceso[0].desc_areas.split('&'));
        for (let i = 0; i < valoresOrden.length; i++) {
            etapa = {
                orden: valoresOrden[i],
                area: valoresAreas[i],
                descripcion: descAreas[i]
            }
            etapas.push(etapa);
            etapa = {};

            if (valoresOrden[i] > maxOrden){
                maxOrden = valoresOrden[i];
            }
        }

        // crear nuevo objeto con el proceso ya formateado
        const procesoEstructurado = {
            proceso_nombre: proceso[0].proceso_nombre,
            etapas: etapas
        }

        // generar los grupos posibles de etapas
        let gruposEtapas = [];
        for (let i = 0; i < maxOrden; i++) {
            gruposEtapas.push(i + 1)
        }

        res.send({proceso: procesoEstructurado, etapasPosibles: gruposEtapas});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/listProducts', isLoggedIn, IsAuthorized('seeListProcesses'), validateProcessesLists(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const procesoId = req.body.processId;
        const productos =  await pool.query('SELECT Productos.nombre AS producto_nombre FROM Procesos INNER JOIN Productos ON Procesos.procesoId = Productos.proceso_id WHERE Procesos.procesoId = ?;', [procesoId]);
        const proceso = await pool.query('SELECT nombre FROM Procesos WHERE procesoId = ?;', [procesoId]);
        res.send({productos: productos, proceso: proceso[0]});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.get('/edit/:id', isLoggedIn, IsAuthorized('editProcesses'), async (req, res) => {
    const {id} = req.params;
    const proceso =  await pool.query('SELECT Procesos.procesoId AS proceso_id, Procesos.nombre AS proceso_nombre, Procesos.descripcion AS proceso_descripcion, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS proceso_areas FROM Procesos INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId WHERE Procesos.ProcesoId = ? GROUP BY Procesos.procesoId;', [id]);
    const areas = await pool.query('SELECT areaId, nombre FROM Areas WHERE nombre != "VENTAS" AND nombre != "COBRANZA"');

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
        proceso_descripcion: proceso[0].proceso_descripcion,
        etapas: etapas
    }

    // generar arreglo con una serie de acuerdo al numero de areas (orden del proceso)
    let ordenPosible = [];
    areas.forEach((_, i) => {
        ordenPosible.push(i+1);
    });

    res.render('processes/edit', {proceso: procesoEstructurado, areas: areas, orden: ordenPosible});
})

router.post('/edit/:id', isLoggedIn, IsAuthorized('editProcesses'), validateProcesses(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const proceso = req.body;
        
        // actualizar proceso
        await pool.query('UPDATE Procesos SET nombre = ?, descripcion = ? WHERE procesoId = ?', [proceso.processname, proceso.processdescription, id])

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
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/processes/edit/'+id);
    }
})

module.exports = router;