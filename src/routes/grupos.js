const express = require('express');
const pool = require('../database.js')
const { isLoggedIn, IsAuthorized } = require('../lib/auth.js');
const { validationResult } = require('express-validator');
const {validateGroups} = require('../lib/validators.js');

const router = express.Router();


/*router.get('/',  (req, res)=>{
    res.render('../views/grupos/addgroup');
});*/

router.get('/addgroup', isLoggedIn, IsAuthorized('addClientsGroups'), async(req, res) =>{
    res.render('grupos/addgroup');
});

router.post('/addgroup', isLoggedIn, IsAuthorized('addClientsGroups'), validateGroups(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const group = req.body;
        const newGroup = {
            nombre: group.namegroup,
            descripcion: group.description
        };
        await pool.query('INSERT INTO Grupos SET ?', [newGroup]);
        req.flash('success', 'Grupo agregado correctamente');
        res.redirect('/grupos');
    } else{
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/grupos/addgroup');
    }
});

router.get('/', isLoggedIn, IsAuthorized('seeListClientsGroups'), async (req, res)=>{
    const groups = await pool.query('SELECT Grupos.*, COALESCE(COUNT(Clientes.grupo_id), 0) AS contClientes FROM Grupos LEFT JOIN Clientes ON Grupos.grupoId = Clientes.grupo_id GROUP BY Grupos.grupoId');
    res.render('grupos/listgroup', {groups});
});

router.get('/editgroup/:id', isLoggedIn, IsAuthorized('editClientsGroups'), async (req, res)=>{
    const {id} = req.params;
    const group = await pool.query('SELECT * FROM Grupos WHERE grupoId = ?', [id]);
    res.render('grupos/editgroup', {group: group[0]});
});

router.post('/editgroup/:id', isLoggedIn, IsAuthorized('editClientsGroups'), validateGroups(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});
    
    // En caso de no extistir errores editar el registro
    if (resultadosValidacion.isEmpty()){
        const group = req.body;
        const newGroup = {
            nombre: group.namegroup,
            descripcion: group.description
        };
        await pool.query('UPDATE Grupos SET ? WHERE grupoId = ?', [newGroup, id]);
        req.flash('success', 'Grupo editado correctamente');
        res.redirect('/grupos');
    } else{
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/grupos/editgroup/'+id);

    }
});


module.exports = router;