const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();

router.get('/add', isLoggedIn, async (req, res)=>{
    const areas = await pool.query('SELECT * FROM  Areas');
    res.render('areas/add', {areas: areas});
})

router.post('/add', isLoggedIn, async (req, res)=>{
    const body = req.body;
    const areas = req.body.areas;

    const nuevaArea = {
        nombre: body.areaname,
        activo: body.areastatus,
        descripcion: body.areadescription
    };
    await pool.query('INSERT INTO Areas SET ?', [nuevaArea]);
    req.flash('success', 'El área <b>'+nuevaArea.nombre+'</b> ha sido creada correctamente');
    res.redirect('/areas');
})

router.get('/', isLoggedIn, async (req, res)=>{
    const areas = await pool.query ('SELECT * FROM Areas');
    const total_areas = await pool.query('SELECT COUNT(areaId) AS total_areas FROM areas');
    res.render('areas/list', {areas: areas, total_areas:total_areas[0]});
})

router.get('/edit/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const area = await pool.query('SELECT * FROM Areas WHERE Areas.areaId = ?;', [id]);
    res.render('areas/edit', {area:area[0]});
})

router.post('/edit/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const body = req.body;
    const areas = req.body.areas;

    const area = {
        nombre: body.areaname,
        activo: body.areastatus,
        descripcion: body.areadescription
    }
    await pool.query('UPDATE Areas SET ? WHERE areaId = ?', [area, id]);
    req.flash('success', 'El área <b>'+area.nombre+'</b> ha sido editada correctamente');
    res.redirect('/areas');
})


module.exports = router;