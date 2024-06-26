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
    if (resBody.descuento == 0 ){
        resBody.descuento = 0;
    }
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



router.get('/editclient/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    const client = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [id]);
    res.render('../views/clients/editclient.hbs', {client: client[0], executive, group});
});

router.post('/editclient/:id', isLoggedIn, async(req, res)=>{
    const {id} = req.params;
    const resBody = req.body;
    if (resBody.descuento == 0 ){
        resBody.descuento = 0;
    }  
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
        descuento: null,
        observaciones: resBody.observaciones,
        activo: resBody.status
    };
    await pool.query('UPDATE Clientes SET ? WHERE clienteId = ?', [newClient, id]);
    
    //prueba para ver si funciona editar cliente
    editClient = {
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
    }
    await pool.query('INSERT INTO Clientes SET ?', [editClient]);
    
    req.flash('success', 'El cliente ha sido editado correctamente');
    res.redirect('/clients/infoclient/'+id);
});

//clientes informacion completa

router.get('/infoclient/:id', isLoggedIn, async(req, res)=>{
    const {id} = req.params;
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    const clients = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [id]);
    res.render('../views/clients/infoclient', {client: clients[0], executive, group});
});

module.exports = router; 