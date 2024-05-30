const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');
const router = express.Router();
const { validateCobranza } = require('../lib/validators');
const { validationResult } = require('express-validator');

router.get('/', isLoggedIn, async(req, res) =>{
    const ordenesListas = await pool.query("SELECT Cobranza.*, Ordenes.fechaGen, Cotizaciones.total, Clientes.nombre, Clientes.clienteId FROM Cobranza INNER JOIN Ordenes ON Ordenes.ordenId = Cobranza.orden_id INNER JOIN Cotizaciones ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cobranza.actividadesTotal = Cobranza.actividadesCont AND Cobranza.estatus != 'Cobranza realizada'");
    const ordenesNoListas = await pool.query("SELECT Cobranza.*, Ordenes.fechaGen, Cotizaciones.total, Clientes.nombre, Clientes.clienteId FROM Cobranza INNER JOIN Ordenes ON Ordenes.ordenId = Cobranza.orden_id INNER JOIN Cotizaciones ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cobranza.actividadesTotal != Cobranza.actividadesCont");
    const ordenesTerminadas = await pool.query("SELECT Cobranza.*, Ordenes.fechaGen, Cotizaciones.total, Clientes.nombre, Clientes.clienteId FROM Cobranza INNER JOIN Ordenes ON Ordenes.ordenId = Cobranza.orden_id INNER JOIN Cotizaciones ON Cotizaciones.cotId = Ordenes.cot_id INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId WHERE Cobranza.estatus = 'Cobranza realizada' AND Cobranza.actividadesTotal = Cobranza.actividadesCont");

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

    const ordenes = await pool.query('SELECT * FROM Cobranza WHERE cobranzaId IN (?)', [cobrar]);

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

        var update = {
            tipoPago: resp.forma,
            estatusPago: resp.pago,
            fechaPago: resp.fecLiq,
            folio: resp.referencia
        };
        const idOrdenes = await pool.query('SELECT orden_id FROM Cobranza WHERE cobranzaId IN (?)', [id_cobranza]);
        try{
            
            if (update.estatusPago == "Pagada"){
                update["estatus"] = "Cobranza realizada";
                
                var idOrders;
                for (let i = 0; i < idOrdenes.length; i++){
                    idOrders.push(idOrdenes[i].orden_id);
                }
                var ordenesUpdate = {
                    estatus: "Orden terminada",
                    terminada: 1
                };
                await pool.query('UPDATE Ordenes SET ? WHERE ordenId IN (?)', [ordenesUpdate, idOrders]);
            
            } else{
                update["estatus"] = "Cobranza empezada";
            }

            await pool.query('UPDATE Cobranza SET ? WHERE cobranzaId IN (?)', [update, id_cobranza]);

            res.redirect('/cobranza');
        } catch(error){
            req.flash('error', idOrdenes[0].orden_id);
            res.redirect('/cobranza');
        }
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/cobranza');
    }
});

module.exports = router;