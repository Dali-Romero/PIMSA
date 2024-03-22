const express = require('express');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { validateAreas } = require('../lib/validators.js');

const router = express.Router();

router.get('/add', isLoggedIn, IsAuthorized('addAreas'), async (req, res)=>{
    res.render('areas/add');
})

router.post('/add', isLoggedIn, IsAuthorized('addAreas'), validateAreas(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const body = req.body;

        const nuevaArea = {
            nombre: body.areaname,
            activo: body.areastatus,
            descripcion: body.areadescription
        };

        await pool.query('INSERT INTO Areas SET ?', [nuevaArea]);
        req.flash('success', 'El área <b>'+nuevaArea.nombre+'</b> ha sido creada correctamente');
        res.redirect('/areas');
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/areas/add');
    }
})

router.get('/', isLoggedIn, IsAuthorized('seeListAreas'), async (req, res)=>{
    const areas = await pool.query ('SELECT * FROM Areas');
    const total_areas = await pool.query('SELECT COUNT(areaId) AS total_areas FROM Areas');
    res.render('areas/list', {areas: areas, total_areas:total_areas[0]});
})

router.get('/edit/:id', isLoggedIn, IsAuthorized('editAreas'), async (req, res)=>{
    const {id} = req.params;
    const area = await pool.query('SELECT * FROM Areas WHERE Areas.areaId = ?;', [id]);
    res.render('areas/edit', {area:area[0]});
})

router.post('/edit/:id', isLoggedIn, IsAuthorized('editAreas'), validateAreas(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores editar el registro
    if (resultadosValidacion.isEmpty()){
        const body = req.body;

        const area = {
            nombre: body.areaname,
            activo: body.areastatus,
            descripcion: body.areadescription
        }
        
        await pool.query('UPDATE Areas SET ? WHERE areaId = ?', [area, id]);
        req.flash('success', 'El área <b>'+area.nombre+'</b> ha sido editada correctamente');
        res.redirect('/areas');
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/areas/edit/'+id);
    }
})

module.exports = router;