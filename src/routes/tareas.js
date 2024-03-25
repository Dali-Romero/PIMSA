const express = require('express');
const pool = require('../database');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const router = express.Router();
const { validateTareas } = require('../lib/validators');
const { validationResult } = require('express-validator');

router.get('/', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const rol = req.user.rol_id; 
    var tareasNuevas = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND Tareas.terminada = false AND Tareas.chec = 0 AND Tareas.activa = 1 ORDER BY Ordenes.fechaGen');
    var tareas = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND Tareas.terminada = false AND Tareas.chec = 1 AND Tareas.activa = 1 AND (Tareas.notes NOT LIKE "Error:%" OR Tareas.notes IS NULL) ORDER BY Ordenes.fechaGen');
    var tareasError = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND Tareas.terminada = false AND Tareas.chec = 1 AND Tareas.activa = 1 AND Tareas.notes LIKE "Error:%" ORDER BY Ordenes.fechaGen');
    const conteoNuevos = tareasNuevas.length;
    const conteo = tareas.length + tareasError.length;
    const users = await pool.query('SELECT * FROM Usuarios');
    res.render('../views/tareas/tareasActivas', {tareasNuevas, tareas, tareasError, conteoNuevos, conteo, users});
});

router.get('/todas', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const rol = req.user.rol_id; 
    var tareasNuevas = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND Tareas.terminada = false AND Tareas.chec = 0 AND Tareas.activa = 1 ORDER BY Ordenes.fechaGen AND Tareas.tareaId');
    var tareas = await pool.query('SELECT Tareas.*, Ordenes.fechaGen, Ordenes.fechaEnt FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND (Tareas.notes NOT LIKE "Error:%" OR Tareas.notes IS NULL) ORDER BY Ordenes.fechaGen AND Tareas.tareaId');
    var tareasError = await pool.query('SELECT Tareas.*, Ordenes.fechaGen, Ordenes.fechaEnt FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND Tareas.notes LIKE "Error:%" ORDER BY Ordenes.fechaGen AND Tareas.tareaId')
    const conteoNuevos = tareasNuevas.length;
    const conteo = tareas.length + tareasError.length;
    const users = await pool.query('SELECT * FROM Usuarios');
    res.render('../views/tareas/todasTareas', {tareasNuevas, tareas, tareasError, conteoNuevos, conteo, users});
});

router.get('/historial', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const rol = req.user.rol_id; 
    var tareas = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN AreasRoles ON Tareas.area_id = AreasRoles.area_id WHERE AreasRoles.rol_id = ' + rol + ' AND Tareas.terminada = true ORDER BY Ordenes.fechaGen');
    const conteo = tareas.length;
    const users = await pool.query('SELECT * FROM Usuarios');
    res.render('../views/tareas/historialTareas', {tareas, conteo, users});
});

router.get('/historial/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const {id} = req.params;
    const machines = await pool.query('SELECT * FROM Maquinas')
    const users = await pool.query('SELECT * FROM Usuarios');
    const tareas = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Tareas.tareaId = ?', [id]);
    res.render('../views/tareas/regresarTareas', {tarea: tareas[0], users, machines});
});

router.post('/restore/:id', isLoggedIn, IsAuthorized('tasksEmployees'), validateTareas(), async(req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});
    const {id} = req.params;

    // En caso de no existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        const info = req.body;
        var tarea = await pool.query('SELECT * FROM Tareas WHERE tareaId = ?', [id]);
        tarea = tarea[0]
        var update = {
            activa: 0,
            chec: 0
        };
        const tarAnt = await pool.query('SELECT * FROM Tareas WHERE tareaorden_id = ? AND sucesion = ?', [tarea.tareaorden_id, Number(tarea.sucesion) - 1]);
        await pool.query('UPDATE Tareas SET ? WHERE tareaId = ?', [update, id]);
        tarAnt.forEach(async function(anterior) {
            update = {
                activa: 1,
                chec: 0,
                terminada: 0,
                notes: "Error: " + info.descripcion,
                maquina_id: info.maquina,
                usuario_id: info.usuario
            };
            await pool.query('UPDATE Tareas SET ? WHERE tareaId = ?', [update, anterior.tareaId]);
        });
        res.redirect('/tareas'); 

    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/tareas/restore/'+id);
    }
});

router.get('/enterado/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    var editTarea = {
        chec: 1,
        usuario_id: req.user.usuarioId
    };
    const {id} = req.params;
    await pool.query('UPDATE Tareas SET ? WHERE tareaId = ?', [editTarea, id]);
    res.redirect('/tareas');
});

router.get('/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const {id} = req.params;
    const machines = await pool.query('SELECT * FROM Maquinas')
    const users = await pool.query('SELECT * FROM Usuarios');
    const tareas = await pool.query('SELECT * FROM Tareas INNER JOIN Ordenes ON Tareas.orden_id = Ordenes.ordenId INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Tareas.tareaId = ?', [id]);
    res.render('../views/tareas/terminarTareas', {tarea: tareas[0], users, machines});
});

router.post('/terminar/:id', isLoggedIn, IsAuthorized('tasksEmployees'), validateTareas(), async(req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});
    const {id} = req.params;

    // En caso de no existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        var ordenId = await pool.query('SELECT tareaorden_id, orden_id FROM Tareas WHERE tareaId = ' + id);
        var orden = ordenId[0].orden_id
        ordenId = ordenId[0].tareaorden_id;
        const restareas = await pool.query('SELECT * FROM Tareas WHERE tareaorden_id = ' + ordenId + ' AND terminada = False ORDER BY sucesion');
        const tarea = req.body;
        var editTarea = {
            maquina_id: tarea.maquina,
            usuario_id: tarea.usuario,
            notes: tarea.descripcion
        };
        await pool.query('UPDATE Tareas SET ? WHERE tareaorden_id = ? AND terminada = 0', [editTarea, ordenId])
        editTarea = {
            terminada: 1,
            activa: 0
        };
        await pool.query('UPDATE Tareas SET ? WHERE tareaId = ?', [editTarea, id]);
        editTarea = {
            activa: 1
        };
        if (restareas.length > 1){
            if (restareas.length > 2){
                if (restareas[1].sucesion == restareas[2].sucesion){
                    // Si dos tareas tienen la misma sucesion se activan dos tareas
                    await pool.query('UPDATE Tareas SET ? WHERE tareaId = ?', [editTarea, restareas[2].tareaId]);
                }
            }
            await pool.query('UPDATE Tareas SET ? WHERE tareaId = ?', [editTarea, restareas[1].tareaId]);
        };
        // Se actualiza cobranza
        if (restareas.length == 1){
            var cobranza = await pool.query('SELECT actividadesCont, cobranzaId, actividadesTotal FROM Cobranza WHERE orden_id = ?', [orden])

            if (cobranza[0].actividadesCont == (cobranza[0].actividadesTotal + 1)){
                editTarea = {
                    actividadesCont: Number(cobranza[0].actividadesCont) + 1,
                    estatus: 'Productos terminados.'
                };
            } else {
                editTarea = {
                    actividadesCont: Number(cobranza[0].actividadesCont) + 1
                };
            }

            await pool.query('UPDATE Cobranza SET ? WHERE cobranzaId = ?', [editTarea, cobranza[0].cobranzaId]);
        }
    
        res.redirect('/tareas');
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/tareas/'+id);
    }
});

router.get('/create/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
    var productos = await pool.query('SELECT ProductosCotizados.producto_id, ProductosCotizados.prodCotizadoId FROM ProductosCotizados INNER JOIN Ordenes ON Ordenes.cot_id = ProductosCotizados.cot_id WHERE Ordenes.ordenId = ?', [id]);
    var productosfuera = await pool.query('SELECT FueraCatalogoCotizados.* FROM FueraCatalogoCotizados INNER JOIN Ordenes ON Ordenes.cot_id = FueraCatalogoCotizados.cot_id WHERE Ordenes.ordenId = ?', [id]);
    console.log(productosfuera);
    var contador = 0

    // Se crean las tareas para los productos que existen en catalogo
    productos.forEach(async function(producto) {
        contador += 1;
        var ordenProceso = await pool.query('SELECT * FROM ProcesosOrdenes INNER JOIN Productos ON Productos.proceso_id = ProcesosOrdenes.proceso_id WHERE Productos.productoId = ?', [producto.producto_id]);
        var tareas = []; 
        var tareasOrden = {
            orden_id: id,
            fueracatalogo: 0,
            cotizadoId: producto.prodCotizadoId
        }
        var resProceso = await pool.query('INSERT INTO TareasOrden SET ?;', [tareasOrden]);
        for (let i = 0; i < ordenProceso.length; i++){
            if (ordenProceso[i].orden == 1){
                tareas.push([ordenProceso[i].nombre, Number(id), ordenProceso[i].area_id, 0, 0, 1, ordenProceso[i].orden, resProceso.insertId]);
            } else{
                tareas.push([ordenProceso[i].nombre, Number(id), ordenProceso[i].area_id, 0, 0, 0, ordenProceso[i].orden, resProceso.insertId]);
            }
        }
        var res = await pool.query('INSERT INTO Tareas (nombre, orden_id, area_id, terminada, chec, activa, sucesion, tareaorden_id) VALUES ?;', [tareas]);
    });

    // Se crean las tareas para los productos fuera de catalogo
    productosfuera.forEach(async function(producto) { 
        contador += 1;
        var ordenProceso = await pool.query('SELECT * FROM ProcesosOrdenes INNER JOIN FueraCatalogoCotizados ON FueraCatalogoCotizados.proceso_id = ProcesosOrdenes.proceso_id WHERE ProcesosOrdenes.proceso_id = ?', [producto.proceso_id]);
        var tareas = [];
        var tareasOrden = { 
            orden_id: id,
            fueracatalogo: 1,
            cotizadoId: producto.fueraCotizadoId
        }
        var resProceso = await pool.query('INSERT INTO TareasOrden SET ?;', [tareasOrden]);
        for (let i = 0; i < ordenProceso.length; i++){
            if (ordenProceso[i].orden == 1){
                tareas.push([ordenProceso[i].concepto, Number(id), ordenProceso[i].area_id, 0, 0, 1, ordenProceso[i].orden, resProceso.insertId]);
            } else{
                tareas.push([ordenProceso[i].concepto, Number(id), ordenProceso[i].area_id, 0, 0, 0, ordenProceso[i].orden, resProceso.insertId]);
            }
        }
        var res = await pool.query('INSERT INTO Tareas (nombre, orden_id, area_id, terminada, chec, activa, sucesion, tareaorden_id) VALUES ?;', [tareas]);
    });

    // Se crea la tarea de cobranza
    var tareaCobr = {
        orden_id: Number(id),
        estatus: "Productos inconclusos.",
        actividadesTotal: contador,
        actividadesCont: 0
    };
    await pool.query('INSERT INTO Cobranza SET ?', [tareaCobr]);

    //res.redirect('/tareas');
    req.flash('success', 'La orden <b>OT-'+id+'</b> ha sido enviada a producción');
    res.redirect('/orders');
});

router.get('/info/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    var {id} = req.params;
    var fueraCatalogo = await pool.query('SELECT TareasOrden.fueracatalogo, TareasOrden.cotizadoId FROM TareasOrden INNER JOIN Tareas ON Tareas.tareaorden_id = TareasOrden.tareaOrdenId WHERE Tareas.tareaId = ?', [Number(id)]);
    if (fueraCatalogo[0].fueracatalogo){
        var datos = await pool.query('SELECT FueraCatalogoCotizados.*, Tareas.*, Ordenes.*, Cotizaciones.* FROM FueraCatalogoCotizados INNER JOIN Cotizaciones ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN TareasOrden ON TareasOrden.cotizadoId = FueraCatalogoCotizados.fueraCotizadoId INNER JOIN Tareas ON Tareas.tareaorden_id = TareasOrden.tareaOrdenId WHERE Tareas.tareaId = ? AND FueraCatalogoCotizados.fueraCotizadoId = ?', [id, Number(fueraCatalogo[0].cotizadoId)]);
        var tareas = await pool.query('SELECT * FROM Tareas WHERE tareaorden_id = ?', [datos[0].tareaorden_id]);
        var areas = await pool.query('SELECT * FROM Areas');
        res.render('../views/tareas/infoTareas', {datos: datos[0], tareas, areas});
    } else{
        var datos = await pool.query('SELECT ProductosCotizados.*, Productos.*, Tareas.*, Ordenes.*, Cotizaciones.* FROM ProductosCotizados INNER JOIN Cotizaciones ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id INNER JOIN Ordenes ON Ordenes.cot_id = Cotizaciones.cotId INNER JOIN TareasOrden ON TareasOrden.cotizadoId = ProductosCotizados.prodCotizadoId INNER JOIN Tareas ON TareasOrden.tareaOrdenId = Tareas.tareaorden_id INNER JOIN Productos ON Productos.productoId = ProductosCotizados.producto_id WHERE Tareas.tareaId = ? AND ProductosCotizados.prodCotizadoId = ?', [id, Number(fueraCatalogo[0].cotizadoId)]);
        var tareas = await pool.query('SELECT * FROM Tareas WHERE tareaorden_id = ?', [datos[0].tareaorden_id]);
        var areas = await pool.query('SELECT * FROM Areas');
        res.render('../views/tareas/infoTareas', {datos: datos[0], tareas, areas});
    }
});

module.exports = router;