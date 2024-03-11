const express = require('express');
const pool = require('../database');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const router = express.Router();
const { validateTareas } = require('../lib/validators');
const { validationResult } = require('express-validator');

router.get('/', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const rol = req.user.rol_id; 
    var tareasNuevas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND tareas.terminada = false AND tareas.check = 0 AND tareas.activa = 1 ORDER BY ordenes.fechaGen');
    var tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND tareas.terminada = false AND tareas.check = 1 AND tareas.activa = 1 AND (tareas.notes NOT LIKE "Error:%" OR tareas.notes IS NULL) ORDER BY ordenes.fechaGen');
    var tareasError = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND tareas.terminada = false AND tareas.check = 1 AND tareas.activa = 1 AND tareas.notes LIKE "Error:%" ORDER BY ordenes.fechaGen');
    const conteoNuevos = tareasNuevas.length;
    const conteo = tareas.length + tareasError.length;
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/tareas/tareasActivas', {tareasNuevas, tareas, tareasError, conteoNuevos, conteo, users});
});

router.get('/todas', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const rol = req.user.rol_id; 
    var tareasNuevas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND tareas.terminada = false AND tareas.check = 0 AND tareas.activa = 1 ORDER BY ordenes.fechaGen AND tareas.tareaId');
    var tareas = await pool.query('SELECT tareas.*, ordenes.fechaGen, ordenes.fechaEnt FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND (tareas.notes NOT LIKE "Error:%" OR tareas.notes IS NULL) ORDER BY ordenes.fechaGen AND tareas.tareaId');
    var tareasError = await pool.query('SELECT tareas.*, ordenes.fechaGen, ordenes.fechaEnt FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND tareas.notes LIKE "Error:%" ORDER BY ordenes.fechaGen AND tareas.tareaId')
    const conteoNuevos = tareasNuevas.length;
    const conteo = tareas.length + tareasError.length;
    console.log(tareas)
    console.log(tareasError)
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/tareas/todasTareas', {tareasNuevas, tareas, tareasError, conteoNuevos, conteo, users});
});

router.get('/historial', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const rol = req.user.rol_id; 
    var tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId INNER JOIN areasroles ON tareas.area_id = areasroles.area_id WHERE areasroles.rol_id = ' + rol + ' AND tareas.terminada = true ORDER BY ordenes.fechaGen');
    const conteo = tareas.length;
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/tareas/historialTareas', {tareas, conteo, users});
});

router.get('/historial/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const {id} = req.params;
    const machines = await pool.query('SELECT * FROM maquinas')
    const users = await pool.query('SELECT * FROM usuarios');
    const tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.tareaId = ?', [id]);
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
        var tarea = await pool.query('SELECT * FROM tareas WHERE tareaId = ?', [id]);
        tarea = tarea[0]
        var update = {
            activa: 0,
            check: 0
        };
        const tarAnt = await pool.query('SELECT * FROM tareas WHERE tareaorden_id = ? AND sucesion = ?', [tarea.tareaorden_id, Number(tarea.sucesion) - 1]);
        await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [update, id]);
        tarAnt.forEach(async function(anterior) {
            update = {
                activa: 1,
                check: 0,
                terminada: 0,
                notes: "Error: " + info.descripcion,
                maquina_id: info.maquina,
                usuario_id: info.usuario
            };
            await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [update, anterior.tareaId]);
        });
        res.redirect('/tareas'); 

    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/tareas/restore/'+id);
    }
});

router.get('/enterado/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    var editTarea = {
        check: 1,
        usuario_id: req.user.usuarioId
    };
    const {id} = req.params;
    await pool.query('UPDATE tareas SET ? WHERE tareaId = ?', [editTarea, id]);
    res.redirect('/tareas');
});

router.get('/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    const {id} = req.params;
    const machines = await pool.query('SELECT * FROM maquinas')
    const users = await pool.query('SELECT * FROM usuarios');
    const tareas = await pool.query('SELECT * FROM tareas INNER JOIN ordenes ON tareas.orden_id = ordenes.ordenId INNER JOIN cotizaciones ON ordenes.cot_id = cotizaciones.cotId WHERE tareas.tareaId = ?', [id]);
    res.render('../views/tareas/terminarTareas', {tarea: tareas[0], users, machines});
});

router.post('/terminar/:id', isLoggedIn, IsAuthorized('tasksEmployees'), validateTareas(), async(req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});
    const {id} = req.params;

    // En caso de no existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        var ordenId = await pool.query('SELECT tareaorden_id, orden_id FROM tareas WHERE tareaId = ' + id);
        var orden = ordenId[0].orden_id
        ordenId = ordenId[0].tareaorden_id;
        const restareas = await pool.query('SELECT * FROM tareas WHERE tareaorden_id = ' + ordenId + ' AND terminada = False ORDER BY sucesion');
        const tarea = req.body;
        console.log(tarea);
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
        };
        // Se actualiza cobranza
        if (restareas.length == 1){
            var cobranza = await pool.query('SELECT actividadesCont, cobranzaId, actividadesTotal FROM cobranza WHERE orden_id = ?', [orden])

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

            await pool.query('UPDATE cobranza SET ? WHERE cobranzaId = ?', [editTarea, cobranza[0].cobranzaId]);
        }
    
        res.redirect('/tareas');
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/tareas/'+id);
    }
});

router.get('/create/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
    var productos = await pool.query('SELECT productoscotizados.producto_id, productoscotizados.prodCotizadoId FROM productoscotizados INNER JOIN ordenes ON ordenes.cot_id = productoscotizados.cot_id WHERE ordenes.ordenId = ?', [id]);
    console.log(productos);
    var productosfuera = await pool.query('SELECT fueracatalogocotizados.* FROM fueracatalogocotizados INNER JOIN ordenes ON ordenes.cot_id = fueracatalogocotizados.cot_id WHERE ordenes.ordenId = ?', [id]);
    console.log(productosfuera);
    var contador = 0

    // Se crean las tareas para los productos que existen en catalogo
    productos.forEach(async function(producto) {
        contador += 1;
        var ordenProceso = await pool.query('SELECT * FROM procesosordenes INNER JOIN productos ON productos.proceso_id = procesosordenes.proceso_id WHERE productos.productoId = ?', [producto.producto_id]);
        console.log(ordenProceso);
        var tareas = []; 
        var tareasOrden = {
            orden_id: id,
            fueracatalogo: 0,
            cotizadoId: producto.prodCotizadoId
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

    // Se crean las tareas para los productos fuera de catalogo
    productosfuera.forEach(async function(producto) { 
        contador += 1;
        var ordenProceso = await pool.query('SELECT * FROM procesosordenes INNER JOIN fueracatalogocotizados ON fueracatalogocotizados.proceso_id = procesosordenes.proceso_id WHERE procesosordenes.proceso_id = ?', [producto.proceso_id]);
        var tareas = [];
        var tareasOrden = { 
            orden_id: id,
            fueracatalogo: 1,
            cotizadoId: producto.fueraCotizadoId
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

    // Se crea la tarea de cobranza
    var tareaCobr = {
        orden_id: Number(id),
        estatus: "Productos inconclusos.",
        actividadesTotal: contador
    };
    await pool.query('INSERT INTO cobranza SET ?', [tareaCobr]);

    //res.redirect('/tareas');
    req.flash('success', 'La orden <b>OT-'+id+'</b> ha sido enviada a producción');
    res.redirect('/orders');
});

router.get('/info/:id', isLoggedIn, IsAuthorized('tasksEmployees'), async(req, res) =>{
    var {id} = req.params;
    var fueraCatalogo = await pool.query('SELECT tareasorden.fueracatalogo, tareasorden.cotizadoId FROM tareasorden INNER JOIN tareas ON tareas.tareaorden_id = tareasorden.tareaOrdenId WHERE tareas.tareaId = ?', [Number(id)]);
    if (fueraCatalogo[0].fueracatalogo){
        var datos = await pool.query('SELECT fueracatalogocotizados.*, tareas.*, ordenes.*, cotizaciones.* FROM fueracatalogocotizados INNER JOIN cotizaciones ON cotizaciones.cotId = fueracatalogocotizados.cot_id INNER JOIN ordenes ON ordenes.cot_id = cotizaciones.cotId INNER JOIN tareasorden ON tareasorden.cotizadoId = fueracatalogocotizados.fueraCotizadoId INNER JOIN tareas ON tareas.tareaorden_id = tareasorden.tareaOrdenId WHERE tareas.tareaId = ? AND fueracatalogocotizados.fueraCotizadoId = ?', [id, Number(fueraCatalogo[0].cotizadoId)]);
        var tareas = await pool.query('SELECT * FROM tareas WHERE tareaorden_id = ?', [datos[0].tareaorden_id]);
        var areas = await pool.query('SELECT * FROM areas');
        res.render('../views/tareas/infoTareas', {datos: datos[0], tareas, areas});
    } else{
        var datos = await pool.query('SELECT productosCotizados.*, productos.*, tareas.*, ordenes.*, cotizaciones.* FROM productosCotizados INNER JOIN cotizaciones ON cotizaciones.cotId = fueracatalogocotizados.cot_id INNER JOIN ordenes ON ordenes.cot_id = cotizaciones.cotId INNER JOIN tareasorden ON tareasorden.cotizadoId = productoscotizados.prodCotizadoId INNER JOIN tareas ON tareasorden.tareaOrdenId = tareas.tareaorden_id INNER JOIN productos ON productos.productoId = productoscotizados.producto_id WHERE tareas.tareaId = ? AND productoscotizados.prodCotizadoId = ?', [id, Number(fueraCatalogo[0].cotizadoId)]);
        var tareas = await pool.query('SELECT * FROM tareas WHERE tareaorden_id = ?', [datos[0].tareaorden_id]);
        var areas = await pool.query('SELECT * FROM areas');
        res.render('../views/tareas/infoTareas', {datos: datos[0], tareas, areas});
    }
});

module.exports = router;