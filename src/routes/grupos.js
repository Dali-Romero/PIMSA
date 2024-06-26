const express = require('express');
const pool = require('../database.js')
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();


/*router.get('/',  (req, res)=>{
    res.render('../views/grupos/addgroup');
});*/

router.get('/addgroup', async(req, res) =>{
    res.render('grupos/addgroup');
});

router.post('/addgroup', async (req, res)=>{
    const group = req.body;
    const newGroup = {
        nombre: group.namegroup,
        descripcion: group.description
    };
    await pool.query('INSERT INTO Grupos SET ?', [newGroup]);
    req.flash('success', 'Grupo agregado correctamente');
    res.redirect('/grupos');
});

router.get('/', async (req, res)=>{
    const groups = await pool.query('SELECT * FROM Grupos');
    res.render('grupos/listgroup', {groups});
});

router.get('/editgroup/:id', async (req, res)=>{
    const {id} = req.params;
    const group = await pool.query('SELECT * FROM Grupos WHERE grupoId = ?', [id]);
    res.render('grupos/editgroup', {group: group[0]});
});

router.post('/editgroup/:id', async (req, res)=>{
    const {id} = req.params;
    const group = req.body;
    const newGroup = {
        nombre: group.namegroup,
        descripcion: group.description
    };
    await pool.query('UPDATE Grupos SET ? WHERE grupoId = ?', [newGroup, id]);
    req.flash('success', 'Grupo editado correctamente');
    res.redirect('/grupos');
});


module.exports = router;