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
    res.render('machines/list.hbs', {machines});
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
    req.flash('success', 'Máquina editada correctamente');
    res.redirect('/machines');
});

module.exports = router;