const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');
const router = express.Router();
const { validateCobranza } = require('../lib/validators');
const { validationResult } = require('express-validator');

router.get('/', isLoggedIn, async(req, res) =>{
    const ordenesListas = await pool.query("SELECT cobranza.*, ordenes.fechaGen, cotizaciones.total, clientes.nombre, clientes.clienteId FROM cobranza INNER JOIN ordenes ON ordenes.ordenId = cobranza.orden_id INNER JOIN cotizaciones ON cotizaciones.cotId = ordenes.cot_id INNER JOIN clientes ON cotizaciones.cliente_id = clientes.clienteId WHERE cobranza.actividadesTotal = cobranza.actividadesCont AND cobranza.estatus != 'Cobranza realizada'");
    const ordenesNoListas = await pool.query("SELECT cobranza.*, ordenes.fechaGen, cotizaciones.total, clientes.nombre, clientes.clienteId FROM cobranza INNER JOIN ordenes ON ordenes.ordenId = cobranza.orden_id INNER JOIN cotizaciones ON cotizaciones.cotId = ordenes.cot_id INNER JOIN clientes ON cotizaciones.cliente_id = clientes.clienteId WHERE cobranza.actividadesTotal != cobranza.actividadesCont");
    const ordenesTerminadas = await pool.query("SELECT cobranza.*, ordenes.fechaGen, cotizaciones.total, clientes.nombre, clientes.clienteId FROM cobranza INNER JOIN ordenes ON ordenes.ordenId = cobranza.orden_id INNER JOIN cotizaciones ON cotizaciones.cotId = ordenes.cot_id INNER JOIN clientes ON cotizaciones.cliente_id = clientes.clienteId WHERE cobranza.estatus = 'Cobranza realizada' AND cobranza.actividadesTotal = cobranza.actividadesCont");

    const conteoListas = ordenesListas.length;
    const conteoNoListas = ordenesNoListas.length;
    const conteoTerminadas = ordenesTerminadas.length; 

    res.render('../views/cobranza/all', {ordenesListas, ordenesNoListas, ordenesTerminadas, conteoListas, conteoNoListas, conteoTerminadas});
});

router.post('/', isLoggedIn, async(req, res) =>{
    var {cobrar, buton} = req.body;
    if (typeof(cobrar) == "string"){
        cobrar = [cobrar];
    } else if (typeof(cobrar) == "undefined"){
        cobrar = [buton];
    }
    if (!cobrar.includes(buton)){
        cobrar.push(buton);
    }

    const ordenes = await pool.query('SELECT * FROM cobranza WHERE cobranzaId IN (?)', [cobrar]);

    console.log(ordenes);
    
    res.render('../views/cobranza/gestion', {ordenes});
});

router.post('/terminar', isLoggedIn, validateCobranza(), async(req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        const resp = req.body;
        const { id_cobranza } = req.body;
        console.log(resp);
        console.log(id_cobranza);

        const update = {
            tipoPago: resp.forma,
            estatusPago: resp.pago,
            fechaPago: resp.fecLiq,
            folio: resp.referencia
        };

        if (update.estatusPago == "Pagada"){
            update["estatus"] = "Cobranza realizada";
        } else{
            update["estatus"] = "Cobranza empezada";
        }

        await pool.query('UPDATE cobranza SET ? WHERE cobranzaId IN (?)', [update, id_cobranza]);

        res.redirect('/cobranza');
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/cobranza');
    }
});

module.exports = router;