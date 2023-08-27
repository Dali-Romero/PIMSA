const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router()

router.get('/addclient', async (req, res)=> {
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    res.render('clients/addclient', {group, executive});
});

router.post('/addclient', async (req, res)=>{
    const resBody = req.body;
    const newClient = {
        nombre: resBody.tradename,
        usuario_id: resBody.executive,
        grupo_id: resBody.group,
        contacto: resBody.contact,
        razonSocial: resBody.companyname,
        rfc: resBody.rfc, 
        domCalle: resBody.street,
        domNumEx: resBody.outernumber,
        domNumIn: resBody.innernumber,
        domColonia: resBody.colony, 
        domCp: resBody.cp, 
        domEstado: resBody.state, 
        domCiudad: resBody.city, 
        telefono: resBody.telephone,
        telefonoExt: resBody.extension,
        celular: resBody.cell,
        correoElec: resBody.email,
        correoElecAlt: resBody.emailAlt,
        limiteCredito: resBody.creditlimit,
        diasCredito: resBody.creditdays,
        descuento: resBody.descuento,
        observaciones: resBody.observaciones,
        activo: resBody.status
    };
    await pool.query('INSERT INTO Clientes SET ?', [newClient]);
    req.flash('success', 'Cliente agregado correctamente');
    res.redirect('/clients');
});

router.get('/', isLoggedIn, async (req, res)=>{
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    const clients = await pool.query('SELECT * FROM Clientes');
    let activos = 0
    let inactivos = 0
    for(let i in clients){
        if (clients[i].activo){
            activos++;
        }else{
            inactivos++;
        }
    }
    res.render('clients/listclient.hbs', {clients:clients, activos:activos, inactivos:inactivos, group, executive});
});

//clientes informacion completa

router.get('/editclient/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const client = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [id]);
    res.render('clients/editclient', {client: client[0]});
});

router.post('/editclient/:id', isLoggedIn, async(req, res)=>{
    const {id} = req.params;
    const resBody = req.body;
    const newClient = {
        nombre: resBody.tradename,
        usuario_id: resBody.executive,
        grupo_id: resBody.group,
        contacto: resBody.contact,
        razonSocial: resBody.companyname,
        rfc: resBody.rfc, 
        domCalle: resBody.street,
        domNumEx: resBody.outernumber,
        domNumIn: resBody.innernumber,
        domColonia: resBody.colony, 
        domCp: resBody.cp, 
        domEstado: resBody.state, 
        domCiudad: resBody.city, 
        telefono: resBody.telephone,
        telefonoExt: resBody.extension,
        celular: resBody.cell,
        correoElec: resBody.email,
        correoElecAlt: resBody.emailAlt,
        limiteCredito: resBody.creditlimit,
        diasCredito: resBody.creditdays,
        descuento: resBody.descuento,
        observaciones: resBody.observaciones,
        activo: resBody.status
    };
    await pool.query('UPDATE Clientes SET ? WHERE clienteId = ?', [newClient, id]);
    req.flash('success', 'El cliente editado correctamente');
    res.redirect('/clients');
});

module.exports = router; 