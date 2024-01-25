const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, async(req, res) =>{
    const area = req.user.rol_id; 
    var tareasNuevas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' AND tareas.terminada = false AND tareas.check = 0 AND tareas.activa = 1 ORDER BY ordenes.fechaGen');
    var tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' AND tareas.terminada = false AND tareas.check = 1 AND tareas.activa = 1 ORDER BY ordenes.fechaGen');
    const conteoNuevos = tareasNuevas.length;
    const conteo = tareas.length;
    for (var i= 0; i < tareasNuevas.length; i++){
        tareasNuevas[i].fechaGen = tareasNuevas[i].fechaGen.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
        tareasNuevas[i].fechaEnt = tareasNuevas[i].fechaEnt.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    }
    for (var i= 0; i < tareas.length; i++){
        tareas[i].fechaGen = tareas[i].fechaGen.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
        tareas[i].fechaEnt = tareas[i].fechaEnt.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    }
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/tareas/tareasActivas', {tareasNuevas, tareas, conteoNuevos, conteo, users});
});

router.get('/todas', isLoggedIn, async(req, res) =>{
    const area = req.user.rol_id; 
    var tareasNuevas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' AND tareas.terminada = false AND tareas.check = 0 AND tareas.activa = 1 ORDER BY ordenes.fechaGen AND tareas.tareaId');
    var tareas = await pool.query('SELECT tareas.*, ordenes.fechaGen, ordenes.fechaEnt FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' ORDER BY ordenes.fechaGen AND tareas.tareaId');
    const conteoNuevos = tareasNuevas.length;
    const conteo = tareas.length;
    for (var i= 0; i < tareasNuevas.length; i++){
        tareasNuevas[i].fechaGen = tareasNuevas[i].fechaGen.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
        tareasNuevas[i].fechaEnt = tareasNuevas[i].fechaEnt.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    }
    for (var i= 0; i < tareas.length; i++){
        tareas[i].fechaGen = tareas[i].fechaGen.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
        tareas[i].fechaEnt = tareas[i].fechaEnt.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    }
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/tareas/todasTareas', {tareasNuevas, tareas, conteoNuevos, conteo, users});
});

router.get('/historial', isLoggedIn, async(req, res) =>{
    const area = req.user.rol_id; 
    var tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' AND tareas.terminada = true ORDER BY ordenes.fechaGen');
    const conteo = tareas.length;
    for (var i= 0; i < tareas.length; i++){
        tareas[i].fechaGen = tareas[i].fechaGen.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
        tareas[i].fechaEnt = tareas[i].fechaEnt.toLocaleDateString("es-MX", {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    }
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/tareas/historialTareas', {tareas, conteo, users});
});

router.get('/enterado/:id', isLoggedIn, async(req, res) =>{
    var editTarea = {
        check: 1,
        usuario_id: req.user.usuarioId
    };
    const {id} = req.params;
    await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, id]);
    res.redirect('/tareas');
});

router.get('/:id', isLoggedIn, async(req, res) =>{
    const area = req.user.rol_id;
    const {id} = req.params;
    const machines = await pool.query('SELECT * FROM maquinas')
    const users = await pool.query('SELECT * FROM usuarios');
    const tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.tareaId = ?', [id]);
    res.render('../views/tareas/terminarTareas', {tarea: tareas[0], users, area, machines});
});

router.post('/terminar/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
    var ordenId = await pool.query('SELECT tareaorden_id FROM tareas WHERE tareaId = ' + id);
    ordenId = ordenId[0].tareaorden_id;
    const restareas = await pool.query('SELECT * FROM tareas WHERE tareaorden_id = ' + ordenId + ' AND terminada = False ORDER BY sucesion');
    const tarea = req.body;
    var editTarea = {
        maquina_id: tarea.maquina,
        usuario_id: tarea.usuario,
        notes: tarea.descripcion
    };
    await pool.query('UPDATE tareas SET ? WHERE tareaorden_id = ? AND terminada = 0', [editTarea, ordenId])
    editTarea = {
        terminada: 1,
        activa: 0
    };
    await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, id]);
    editTarea = {
        activa: 1
    };
    if (restareas.length > 1){
        if (restareas.length > 2){
            if (restareas[1].sucesion == restareas[2].sucesion){
                // Si dos tareas tienen la misma sucesion se activan dos tareas
                await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, restareas[2].tareaId]);
            }
        }
        await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, restareas[1].tareaId]);
    }
    res.redirect('/tareas');
});

router.get('/create/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
    var productos = await pool.query('SELECT productoscotizados.producto_id FROM productoscotizados INNER JOIN ordenes ON ordenes.cot_id = productoscotizados.cot_id WHERE ordenes.ordenId = ?', [id]);
    console.log(productos);
    var productosfuera = await pool.query('SELECT fueracatalogocotizados.* FROM fueracatalogocotizados INNER JOIN ordenes ON ordenes.cot_id = fueracatalogocotizados.cot_id WHERE ordenes.ordenId = ?', [id]);
    console.log(productosfuera);
    productos.forEach(async function(producto) {
        var ordenProceso = await pool.query('SELECT * FROM procesosordenes INNER JOIN productos ON productos.proceso_id = procesosordenes.proceso_id WHERE productos.productoId = ?', [producto.producto_id]);
        console.log(ordenProceso);
        var tareas = [];
        var tareasOrden = {
            orden_id: id,
            fueracatalogo: 0
        }
        var resProceso = await pool.query('INSERT INTO tareasorden SET ?;', [tareasOrden]);
        for (let i = 0; i < ordenProceso.length; i++){
            if (ordenProceso[i].orden == 1){
                tareas.push([ordenProceso[i].nombre, Number(id), ordenProceso[i].area_id, 0, 0, 1, ordenProceso[i].orden, resProceso.insertId]);
            } else{
                tareas.push([ordenProceso[i].nombre, Number(id), ordenProceso[i].area_id, 0, 0, 0, ordenProceso[i].orden, resProceso.insertId]);
            }
        }
        var res = await pool.query('INSERT INTO Tareas (nombre, orden_id, area_id, terminada, tareas.check, activa, sucesion, tareaorden_id) VALUES ?;', [tareas]);
        console.log(res);
    });

    productosfuera.forEach(async function(producto) {
        var ordenProceso = await pool.query('SELECT * FROM procesosordenes INNER JOIN fueracatalogocotizados ON fueracatalogocotizados.proceso_id = procesosordenes.proceso_id WHERE procesosordenes.proceso_id = ?', [producto.proceso_id]);
        var tareas = [];
        var tareasOrden = { 
            orden_id: id,
            fueracatalogo: 1
        }
        var resProceso = await pool.query('INSERT INTO tareasorden SET ?;', [tareasOrden]);
        for (let i = 0; i < ordenProceso.length; i++){
            if (ordenProceso[i].orden == 1){
                tareas.push([ordenProceso[i].concepto, Number(id), ordenProceso[i].area_id, 0, 0, 1, ordenProceso[i].orden, resProceso.insertId]);
            } else{
                tareas.push([ordenProceso[i].concepto, Number(id), ordenProceso[i].area_id, 0, 0, 0, ordenProceso[i].orden, resProceso.insertId]);
            }
        }
        var res = await pool.query('INSERT INTO Tareas (nombre, orden_id, area_id, terminada, tareas.check, activa, sucesion, tareaorden_id) VALUES ?;', [tareas]);
        console.log(res);
    });
    res.redirect('/tareas');
});


module.exports = router;