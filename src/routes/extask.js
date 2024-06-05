const express = require('express');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { validateExtaskListStagesProcess, validateExtaskCreateOrder } = require('../lib/validators.js');

const router = express.Router();

router.get('/', isLoggedIn, IsAuthorized('tasksSalesExecutives'), async (req, res)=>{
    const usuarioId = req.user.usuarioId;
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId INNER JOIN Usuarios ON Cotizaciones.usuario_id = Usuarios.usuarioId WHERE Cotizaciones.estatus <> "Ordenada" AND Usuarios.usuarioId = ?;', [usuarioId]);
    //const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.estatus <> "Ordenada";');
    res.render('extask/list', {cotizaciones: cotizaciones});
})

router.get('/history', isLoggedIn, IsAuthorized('tasksSalesExecutives'), async (req, res)=>{
    const usuarioId = req.user.usuarioId;
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Ordenes.ordenId, Clientes.clienteId, Clientes.nombre FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId INNER JOIN Usuarios ON Cotizaciones.usuario_id = Usuarios.usuarioId WHERE Cotizaciones.estatus = "Ordenada" AND Usuarios.usuarioId = ?;', [usuarioId]);
    //const cotizaciones = await pool.query('SELECT Cotizaciones.*, Ordenes.ordenId, Clientes.clienteId, Clientes.nombre FROM Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cotizaciones.estatus = "Ordenada";');
    res.render('extask/history', {cotizaciones: cotizaciones});
})

router.post('/listStagesProcess', isLoggedIn, IsAuthorized('tasksSalesExecutives'), validateExtaskListStagesProcess(), async (req, res) => {
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const cotId = req.body.cotId;

        // informacion para generar orden (procesos)
        const productosFueraCatalogo = await pool.query('SELECT FueraCatalogoCotizados.* FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id WHERE Cotizaciones.cotId = ?;', [cotId]);
        const procesosEnCatalogo = await pool.query('SELECT ProductosCotizados.prodCotizadoId AS prodCotizadoId, Productos.nombre AS producto_nombre, Procesos.procesoId AS procesoId, Procesos.nombre AS proceso_nombre, GROUP_CONCAT(ProcesosOrdenes.orden ORDER BY ProcesosOrdenes.orden ASC) AS orden_areas, GROUP_CONCAT(Areas.nombre ORDER BY ProcesosOrdenes.orden ASC) AS areas FROM (((((Cotizaciones INNER JOIN ProductosCotizados ON Cotizaciones.cotId = ProductosCotizados.cot_id) INNER JOIN Productos ON ProductosCotizados.producto_id = Productos.productoId) INNER JOIN Procesos ON Productos.proceso_id = Procesos.procesoId) INNER JOIN ProcesosOrdenes ON Procesos.procesoId = ProcesosOrdenes.proceso_id) INNER JOIN Areas ON ProcesosOrdenes.area_id = Areas.areaId) WHERE Cotizaciones.cotId = ? GROUP BY prodCotizadoId;', [cotId]);
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

        res.send({procesosEnCatalogo: procesosEnCatalogoArray, productosFueraCatalogo: productosFueraCatalogo, orden: orden_posible, areas: todas_areas,})
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
})

router.post('/generateOrder/:id', isLoggedIn, IsAuthorized('addOrders'), validateExtaskCreateOrder(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const body = req.body;
        const usruarioId = req.user.usuarioId;
        const productosFueraCatalogoId = await pool.query('SELECT FueraCatalogoCotizados.fueraCotizadoId FROM Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id WHERE Cotizaciones.cotId = ?;', [id]);
        
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
        const fechaGen = date.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute: 'numeric', hourCycle: 'h23'});

        const deadline = new Date('2001-01-02');
        const fechaEnt = deadline.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric'});

        const newOrden = {
            fechaGen: fechaGen,
            fechaEnt: fechaEnt,
            cot_id: Number(id),
            usuario_id: usruarioId,
            terminada: 0,
            estatus: "Generada"
        }
        
        const ordenId = await pool.query('INSERT INTO Ordenes SET ?;', [newOrden]);

        // asignar estatus de ordenada a la cotizacion
        await pool.query('UPDATE Cotizaciones SET estatus = "Ordenada" WHERE cotId = ?', [id]);

        req.flash('success', 'La orden <b>OT-'+ordenId.insertId+'</b> ha sido creada correctamente');
        res.redirect('/extask');
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/extask');
    }
})

module.exports = router;