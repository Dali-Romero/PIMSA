const express = require('express');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const { validateClients } = require('../lib/validators.js');

const router = express.Router()

router.get('/addclient', isLoggedIn, IsAuthorized('addClients'), async (req, res)=> {
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    res.render('clients/addclient', {group, executive});
});

router.post('/addclient', isLoggedIn, IsAuthorized('addClients'), validateClients(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
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
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/clients/addclient');
    }
});

router.get('/', isLoggedIn, IsAuthorized('seeListClients'), async (req, res)=>{
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

router.get('/editclient/:id', isLoggedIn, IsAuthorized('editClients'), async (req, res)=>{
    const {id} = req.params;
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    const client = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [id]);
    res.render('../views/clients/editclient.hbs', {client: client[0], executive, group});
});

router.post('/editclient/:id', isLoggedIn, IsAuthorized('editClients'), validateClients(),  async(req, res)=>{
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
    
    req.flash('success', 'El cliente ha sido editado correctamente');
    res.redirect('/clients/infoclient/'+id);

});

//clientes informacion completa
router.get('/infoclient/:id', isLoggedIn, IsAuthorized('seeListClients'), async(req, res)=>{
    const {id} = req.params;
    const executive = await pool.query('SELECT * FROM Usuarios');
    const group = await pool.query('SELECT * FROM Grupos');
    const clients = await pool.query('SELECT * FROM Clientes WHERE clienteId = ?', [id]);
    const cotizacion = await pool.query('SELECT * FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.cliente_id = ?;', [id]);
    const ordenes = await pool.query('SELECT Ordenes.ordenId, Ordenes.fechaGen, IF(DATE(Ordenes.fechaGen) = Ordenes.fechaEnt, "-", Ordenes.fechaEnt) AS fechaEnt, Ordenes.cot_id, Ordenes.terminada, Cotizaciones.cotId, Cotizaciones.fecha, Cotizaciones.cliente_id, Cotizaciones.proyecto, Cotizaciones.observaciones, Cotizaciones.porcentajeDescuento, Cotizaciones.solicitante, Cotizaciones.empleado, Cotizaciones.estatus, Cotizaciones.totalBruto, Cotizaciones.descuento AS descuento_cotizacion, Cotizaciones.subtotal, Cotizaciones.iva, Cotizaciones.total, Clientes.*, Empleados.nombreComp FROM ((((Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId) INNER JOIN Usuarios ON Ordenes.usuario_id = Usuarios.usuarioId) INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId) INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId AND clienteId = ?) ', [id]);
    const cobranza = await pool.query("SELECT cobranza.*, ordenes.fechaGen, cotizaciones.total, clientes.nombre, clientes.clienteId FROM cobranza INNER JOIN ordenes ON ordenes.ordenId = cobranza.orden_id INNER JOIN cotizaciones ON cotizaciones.cotId = ordenes.cot_id INNER JOIN clientes ON cotizaciones.cliente_id = clientes.clienteId WHERE cobranza.actividadesTotal = cobranza.actividadesCont AND cobranza.estatus  AND Cotizaciones.cliente_id = ?;", [id]);
    const deuda = await pool.query('SELECT SUM(total) as deuda FROM Cobranza INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId WHERE Cotizaciones.cliente_id = ? AND estatus <> "Cobranza realizada";',[id]);
    const suma = await pool.query('SELECT SUM(total) as suma  FROM Cotizaciones WHERE Cotizaciones.cliente_id = ? AND estatus <> "Cancelada";', [id]);
    console.log(suma[0]);
    res.render('../views/clients/infoclient', {client: clients[0], executive, group, cotizacion, ordenes: ordenes, cobranza, deuda:deuda[0], suma:suma[0]});
});

module.exports = router; 