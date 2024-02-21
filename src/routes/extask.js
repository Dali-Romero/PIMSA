const express = require('express');
const hbs = require('handlebars');
const fs = require('fs');
const {Stream} = require('stream');
const path = require('path');
const nodemailer = require('nodemailer');
const pool = require('../database.js');
const {moneda, dimensiones, createPdf} = require('../lib/helpers.js');
const { isLoggedIn } = require('../lib/auth.js');
require('../lib/handlebars.js');

const router = express.Router();


router.get('/', isLoggedIn, async (req, res)=>{
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE Cotizaciones.estatus <> "Ordenada";');
    res.render('extask/list', {cotizaciones: cotizaciones});
})


router.get('/history', isLoggedIn, async (req, res)=>{
    const cotizaciones = await pool.query('SELECT Cotizaciones.*, Clientes.clienteId, Clientes.nombre FROM (Cotizaciones INNER JOIN Clientes ON Cotizaciones.cliente_id = Clientes.clienteId) WHERE estatus = "Ordenada";');
    const usuario = await pool.query('SELECT * FROM Usuarios');
    const orden = await pool.query('SELECT Ordenes. *, Ordenes.cot_id FROM  Ordenes INNER JOIN Cotizaciones ON Ordenes.cot_id = Cotizaciones.cotId'); 
    res.render('extask/history', {cotizaciones: cotizaciones, usuario: usuario, orden: orden});
})

router.post('/generateOrder/:id', async (req, res)=>{
    const {id} = req.params;
    const body = req.body;
    const usruarioId = req.user.usuarioId;
    const productosFueraCatalogoId = await pool.query('SELECT FueraCatalogoCotizados.fueraCotizadoId FROM (Cotizaciones INNER JOIN FueraCatalogoCotizados ON Cotizaciones.cotId = FueraCatalogoCotizados.cot_id) WHERE Cotizaciones.cotId = ?;', [id]);

    if(productosFueraCatalogoId.length > 0){
        // separar los procesos dependiendo de los productos
        let j = 0;
        let procesos = {};
        let procesosArray = [];
        const valoresProcesos = Object.values(body);
        for (const key in body) {
            if (j !==0 && j%2 === 0) {
                procesosArray.push(procesos);
                procesos = {};
            }
            procesos[key.replace(/[0-9]/g, '')] = valoresProcesos[j];
            j++;
        }
        procesosArray.push(procesos);

        // generar nuevo proceso para cada producto fuera de catalogo
        let newProcesos = [];
        procesosArray.forEach((element, i) => {
            newProcesos.push([
                'Personalizado'
            ])
        });

        // almacenar n procesos personalizados
        const resultadoProcesos = await pool.query('INSERT INTO Procesos (nombre) VALUES ?;', [newProcesos]);

        // almacenar los procesos en los productos fuera de catalogo
        productosFueraCatalogoId.forEach(async (productoId, i) => {
            await pool.query('UPDATE FueraCatalogoCotizados SET proceso_id = ? WHERE fueraCotizadoId = ?', [resultadoProcesos.insertId + i, Number(productoId.fueraCotizadoId)]);
        });

        // organizar los procesos para su almacenamiento
        let procesosOrden = [];
        procesosArray.forEach((producto, i) => {
            for (let j = 0; j < producto.orderProcess.length; j++) {
                procesosOrden.push([Number(producto.areaProcess[j]), resultadoProcesos.insertId + i, Number(producto.orderProcess[j])]);
            }
        });

        // almacenar los procesos en procesosOrdenes
        await pool.query('INSERT INTO ProcesosOrdenes (area_id, proceso_id, orden) VALUES ?;', [procesosOrden]);
    }

    // crear orden
    const date = new Date();
    fechaGen = date.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute: 'numeric', hour12: false});
    fechaEnt = date.toLocaleDateString('en-CA', {year: 'numeric', month: 'numeric', day: 'numeric'});

    const newOrden = {
        fechaGen: fechaGen,
        fechaEnt: fechaEnt,
        cot_id: Number(id),
        usuario_id: usruarioId,
        terminada: 0
    }
    const resultadoOrden = await pool.query('INSERT INTO Ordenes SET ?;', [newOrden]);

    // asignar estatus de ordenada a la cotizacion
    await pool.query('UPDATE Cotizaciones SET estatus = "Ordenada" WHERE cotId = ?', [id]);

    req.flash('success', 'La orden <b>OT-'+resultadoOrden.insertId+'</b> ha sido creada correctamente');
    res.redirect('/tareas/create/'+resultadoOrden.insertId);
})

module.exports = router;