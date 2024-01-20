const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, async(req, res) =>{
    const area = req.user.rol_id; 
    console.log(area)
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
    var tareasNuevas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' AND tareas.check = 0 ORDER BY ordenes.fechaGen');
    var tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.area_id = ' + area + ' AND tareas.check = 1 ORDER BY ordenes.fechaGen');
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
    var ordenId = await pool.query('SELECT orden_id FROM tareas WHERE tareaId = ' + id);
    ordenId = ordenId[0].orden_id;
    const restareas = await pool.query('SELECT * FROM tareasorden WHERE orden_id = ' + ordenId + ' AND terminada = False ORDER BY sucesion');
    const tarea = req.body;
    var editTarea = {
        maquina_id: tarea.maquina,
        usuario_id: tarea.usuario,
        notes: tarea.descripcion
    };
    await pool.query('UPDATE tareas SET ? WHERE orden_id = ? AND terminada = 0', [editTarea, ordenId])
    editTarea = {
        terminada: 1,
        activa: 0
    };
    await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, id]);
    await pool.query('UPDATE tareasorden SET ? WHERE tarea_id = ?', [editTarea, id])
    editTarea = {
        activa: 1
    };
    console.log(restareas.length)
    if (restareas.length > 1){
        await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, restareas[1].tarea_id]);
        await pool.query('UPDATE tareasorden SET ? WHERE tarea_id = ?', [editTarea, restareas[1].tarea_id])
    }
    res.redirect('/tareas');
});

module.exports = router;