const express = require('express');
const pool = require('../database.js');
const { validationResult } = require('express-validator');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const { validateMachines, validateMachinesListUsers } = require('../lib/validators.js');

const router = express.Router();

router.get('/add', isLoggedIn, IsAuthorized('addMachines'), async (req, res)=>{
    const users = await pool.query('SELECT Usuarios.usuarioId, Empleados.empleadoId, Empleados.nombreComp AS Empleado, Areas.areaId, Areas.nombre AS Area, Roles.rolId, Roles.nombre AS Rol FROM (((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Roles ON Empleados.rol_id = Roles.rolId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id);')
    res.render('machines/add', {users:users});
});

router.post('/add', isLoggedIn, IsAuthorized('addMachines'), validateMachines(), async (req, res)=>{
    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const resBody = req.body;
        const selects = req.body.allowedUser;
        const newMachine = {
            numSerie: resBody.serialnumber,
            marca: resBody.brand,
            nombre: resBody.name,
            tipoCabezal: resBody.headtype,
            numCabezales: resBody.headnum,
            velocidad: resBody.speed,
            tipoTinta: resBody.inktype,
            conTecnico: resBody.techcontact,
            conTecnicoExt: resBody.extension,
            activo: resBody.status
        };
        const {insertId} = await pool.query('INSERT INTO Maquinas SET ?', [newMachine]);
        let machineUsers = [];
        if (selects !== undefined){
            for(let i in selects){
                machineUsers.push([Number(selects[i]), insertId]);
            };
            await pool.query('INSERT INTO MaquinasUsuarios (usuario_id, maquina_id) VALUES ?', [machineUsers]);
        };
        req.flash('success', 'Máquina agregada correctamente');
        res.redirect('/machines');
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/machines/add');
    }
});

router.get('/', isLoggedIn, IsAuthorized('seeListMachines'), async (req, res)=>{
    const machines = await pool.query('SELECT * FROM Maquinas');
    let activas = 0
    let inactivas = 0
    for(let i in machines){
        if (machines[i].activo){
            activas++;
        }else{
            inactivas++;
        }
    }
    res.render('machines/list', {machines:machines, activas:activas, inactivas:inactivas});
});

router.post('/listUsers', isLoggedIn, IsAuthorized('seeListMachines'), validateMachinesListUsers(), async (req, res)=>{
    const id = req.body.idMachine;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const machine = await pool.query('SELECT nombre FROM Maquinas WHERE maquinaId = ?', [id]);
        const assignedUsers = await pool.query('SELECT Empleados.empleadoId, Empleados.nombreComp AS Empleado, Areas.nombre AS Area  FROM ((((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) INNER JOIN MaquinasUsuarios ON Usuarios.usuarioId = MaquinasUsuarios.usuario_id) INNER JOIN Maquinas ON MaquinasUsuarios.maquina_id = Maquinas.maquinaId) WHERE Maquinas.maquinaId = ?;', [id]);
        res.send({machine: machine[0], assignedUsers: assignedUsers, permissions: req.user.permisos});
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.sendStatus(500);
    }
});

router.get('/edit/:id', isLoggedIn, IsAuthorized('editMachines'), async (req, res)=>{
    const {id} = req.params;
    const machine = await pool.query('SELECT * FROM Maquinas WHERE maquinaId = ?', [id]);
    const users = await pool.query('SELECT Usuarios.usuarioId, Empleados.empleadoId, Empleados.nombreComp AS Empleado, Areas.areaId, Areas.nombre AS Area, Roles.rolId, Roles.nombre AS Rol FROM (((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Roles ON Empleados.rol_id = Roles.rolId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id);')
    const selectedUsers = await pool.query('SELECT Maquinas.maquinaId, MaquinasUsuarios.usuario_id, Usuarios.usuarioId, Empleados.empleadoId, Empleados.nombreComp AS Empleado, Areas.areaId, Areas.nombre AS Area, Roles.rolId, Roles.nombre AS Rol FROM (((((Empleados INNER JOIN Areas ON Empleados.area_id = Areas.areaId) INNER JOIN Roles ON Empleados.rol_id = Roles.rolId) INNER JOIN Usuarios ON Empleados.empleadoId = Usuarios.empleado_id) INNER JOIN MaquinasUsuarios ON Usuarios.usuarioId = MaquinasUsuarios.usuario_id) INNER JOIN Maquinas ON MaquinasUsuarios.maquina_id = Maquinas.maquinaId) WHERE Maquinas.maquinaId = ?;', [id]);
    res.render('machines/edit', {machine: machine[0], users:users, selectedUsers:selectedUsers});
});

router.post('/edit/:id', isLoggedIn, IsAuthorized('editMachines'), validateMachines(), async (req, res)=>{
    const {id} = req.params;

    // validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de no extistir errores almacenar el registro
    if (resultadosValidacion.isEmpty()) {
        const resBody = req.body;
        const selects = req.body.allowedUser; 
        const newMachine = {
            numSerie: resBody.serialnumber,
            marca: resBody.brand,
            nombre: resBody.name,
            tipoCabezal: resBody.headtype,
            numCabezales: resBody.headnum,
            velocidad: resBody.speed,
            tipoTinta: resBody.inktype,
            conTecnico: resBody.techcontact,
            conTecnicoExt: resBody.extension,
            activo: resBody.status
        };
        await pool.query('UPDATE Maquinas SET ? WHERE maquinaId = ?', [newMachine, id]);
        await pool.query('DELETE FROM MaquinasUsuarios WHERE maquina_id = ?', [id]);
        let machineUsers = [];
        if (selects !== undefined){
            for(let i in selects){
                machineUsers.push([Number(selects[i]), id]);
            };
            await pool.query('INSERT INTO MaquinasUsuarios (usuario_id, maquina_id) VALUES ?', [machineUsers]);
        }
        req.flash('success', 'La máquina <b>'+newMachine.nombre+'</b> ha sido editada correctamente');
        res.redirect('/machines');
    } else {
        // notificar errores de la validacion
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/machines/edit/'+id);
    }
});

module.exports = router; 