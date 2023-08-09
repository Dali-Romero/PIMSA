const express = require('express');
const pool = require('../database.js');
const {isLoggedIn} = require('../lib/auth.js');

const router = express.Router()

router.get('/add', async (req, res)=>{
    res.render('machines/add');
});

router.post('/add', async (req, res)=>{
    const machine = req.body;
    const newMachine = {
        numSerie: machine.serialnumber,
        marca: machine.brand,
        nombre: machine.name,
        tipoCabezal: machine.headtype,
        numCabezales: machine.headnum,
        velocidad: machine.speed,
        tipoTinta: machine.inktype,
        conTecnico: machine.techcontact,
        conTecnicoExt: machine.extension,
        activo: machine.status
    };
    await pool.query('INSERT INTO Maquinas SET ?', [newMachine]);
    req.flash('success', 'Máquina agregada correctamente');
    res.redirect('/machines');
});

router.get('/', async (req, res)=>{
    const machines = await pool.query('SELECT * FROM Maquinas');
    //const totalActivas = await pool.query('SELECT count(maquinaId) AS countActivas FROM Maquinas WHERE activo = 1');
    //const totalInactivas = await pool.query('SELECT count(maquinaId) AS countInactivas FROM Maquinas WHERE activo = 0');
    let activas = 0
    let inactivas = 0
    for(let i in machines){
        if (machines[i].activo){
            activas++;
        }else{
            inactivas++;
        }
    }
    res.render('machines/list.hbs', {machines:machines, activas:activas, inactivas:inactivas});
    //res.render('machines/list.hbs', {machines:machines, activas:totalActivas[0], inactivas:totalInactivas[0]});
});

router.post('/search', async (req, res)=>{
    const keys = req.body.keys;
    const field = req.body.fieldSearch;
    const searchResult = await pool.query('SELECT * FROM Maquinas WHERE '+field+' LIKE "'+keys+'%"');
    res.send({machines: searchResult});
})

router.post('/orderby', async (req, res)=>{
    const field = req.body.field;
    const order = req.body.order;
    let sortResult = '';
    switch (field) {
        case 'todas':
            sortResult = await pool.query('SELECT * FROM Maquinas');
            break;
        case 'activa':
            sortResult = await pool.query('SELECT * FROM Maquinas WHERE activo = 1');
            break;
        case 'inactiva':
            sortResult = await pool.query('SELECT * FROM Maquinas WHERE activo = 0');
            break;
        default:
            sortResult = await pool.query('SELECT * FROM Maquinas ORDER BY '+field+' '+order);
    }
    res.send({machines: sortResult});
});

router.get('/edit/:id', async (req, res)=>{
    const {id} = req.params;
    const machine = await pool.query('SELECT * FROM Maquinas WHERE maquinaId = ?', [id]);
    res.render('machines/edit', {machine: machine[0]});
});

router.post('/edit/:id', async (req, res)=>{
    const {id} = req.params;
    const machine = req.body;
    const newMachine = {
        numSerie: machine.serialnumber,
        marca: machine.brand,
        nombre: machine.name,
        tipoCabezal: machine.headtype,
        numCabezales: machine.headnum,
        velocidad: machine.speed,
        tipoTinta: machine.inktype,
        conTecnico: machine.techcontact,
        conTecnicoExt: machine.extension,
        activo: machine.status
    };
    await pool.query('UPDATE Maquinas SET ? WHERE maquinaId = ?', [newMachine, id]);
    //req.flash('success', 'Máquina editada correctamente');
    //req.flash('modal', 'Máquina editada correctamente');
    //req.flash('modal_id', id);

    req.flash('toast', 'Máquina editada correctamente');
    req.flash('toast_id', id);

    res.redirect('/machines');
});

module.exports = router;