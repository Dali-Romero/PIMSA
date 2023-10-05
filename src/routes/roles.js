const express = require('express');
const pool = require('../database.js');
const { isLoggedIn } = require('../lib/auth.js');

const router = express.Router();

router.get('/add', isLoggedIn, async (req, res)=>{
    const permisos = await pool.query('SELECT * FROM Permisos');
    res.render('roles/add', {permisos:permisos});
})

router.post('/add', isLoggedIn, async (req, res)=>{
    const body = req.body;
    const permisos = req.body.permissions;

    // guardar nuevo rol
    const nuevoRol = {
        nombre: body.rolename,
        activo: body.rolestatus,
        descripcion: body.roledescription
    };
    const {insertId} = await pool.query('INSERT INTO Roles SET ?', [nuevoRol]);

    // relacionar los permisos con el rol recien creado
    let permisosRoles = []
    if (permisos !== undefined){
        for(let i in permisos){
            permisosRoles.push([Number(permisos[i]), insertId]);
        };
        await pool.query('INSERT INTO PermisosRoles (permiso_id, rol_id) VALUES ?', [permisosRoles]);
    };

    req.flash('success', 'El rol <b>'+nuevoRol.nombre+'</b> ha sido creado correctamente');
    res.redirect('/roles');
})

router.get('/', isLoggedIn, async (req, res)=>{
    const roles = await pool.query('SELECT Roles.rolId, Roles.nombre, Roles.descripcion, Roles.activo, COUNT(Usuarios.rol_id) AS total_usuarios_rol, total_usuario_permisos.total_usuario_permisos FROM ((Roles LEFT JOIN Usuarios ON Roles.rolId = Usuarios.rol_id) LEFT JOIN (SELECT Roles.rolId AS rol_id, COUNT(PermisosRoles.permiso_id) AS total_usuario_permisos FROM Roles LEFT JOIN PermisosRoles ON Roles.rolId = PermisosRoles.rol_id GROUP BY Roles.rolId) AS total_usuario_permisos ON Roles.rolId = total_usuario_permisos.rol_id) GROUP BY Roles.rolId, Roles.nombre, Roles.descripcion, Roles.activo;');
    const total_roles = await pool.query('SELECT COUNT(rolId) AS total_roles FROM Roles;');
    const total_permisos = await pool.query('SELECT COUNT(permisoId) AS total_permisos FROM Permisos;');
    res.render('roles/list', {roles:roles, total_roles:total_roles[0], total_permisos:total_permisos[0]});
})

router.post('/listPermissions', isLoggedIn, async (req, res)=>{
    const rolId = req.body.idRole;
    const permisos = await pool.query('SELECT Permisos.descripcion, Permisos.permiso FROM ((Roles INNER JOIN PermisosRoles ON Roles.rolId = PermisosRoles.rol_id) INNER JOIN Permisos ON PermisosRoles.permiso_id = Permisos.permisoId) WHERE Roles.rolId = ?;', [rolId]);
    const rol = await pool.query('SELECT Roles.nombre FROM Roles WHERE Roles.rolId = ?;', [rolId]);
    res.send({permisos:permisos, rol:rol[0]});
})

router.post('/listAssignedUsers', isLoggedIn, async (req, res)=>{
    const rolId = req.body.idRole;
    const rol = await pool.query('SELECT Roles.nombre FROM Roles WHERE Roles.rolId = ?;', [rolId]);
    const usuariosAsignados = await pool.query('SELECT Empleados.empleadoId, Empleados.nombreComp AS Empleado, Areas.areaId, Areas.nombre AS Area FROM (((Roles INNER JOIN Usuarios ON Roles.rolId = Usuarios.rol_id) INNER JOIN Empleados ON Usuarios.empleado_id = Empleados.empleadoId) INNER JOIN Areas ON Empleados.area_id = Areas.areaId) WHERE Roles.rolId = ?;', [rolId]);
    res.send({rol:rol[0], usuariosAsignados:usuariosAsignados});
})

router.get('/edit/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const rol = await pool.query('SELECT * FROM Roles WHERE Roles.rolId = ?;', [id]);
    const permisos = await pool.query('SELECT DISTINCT Permisos.*, IF(PermisosRoles.permiso_id IN (SELECT PermisosRoles.permiso_id AS permiso_id FROM PermisosRoles INNER JOIN Permisos ON PermisosRoles.permiso_id = Permisos.permisoId WHERE PermisosRoles.rol_id = ?), 1, 0) AS permiso_seleccionado FROM PermisosRoles LEFT JOIN Permisos ON PermisosRoles.permiso_id = Permisos.permisoId;', [id]);
    res.render('roles/edit', {rol:rol[0], permisos:permisos});
})

router.post('/edit/:id', isLoggedIn, async (req, res)=>{
    const {id} = req.params;
    const body = req.body;
    const permisos = req.body.permissions;

    // actualizar rol
    const rol = {
        nombre: body.rolename,
        activo: body.rolestatus,
        descripcion: body.roledescription
    }
    await pool.query('UPDATE Roles SET ? WHERE rolId = ?', [rol, id]);

    // eliminar y volver a añadir los permisos
    let permisosRoles = [];
    if (permisos !== undefined){
        await pool.query('DELETE FROM PermisosRoles WHERE rol_id = ?', [id]);
        for(let i in permisos){
            permisosRoles.push([Number(permisos[i]), id]);
        };
        await pool.query('INSERT INTO PermisosRoles (permiso_id, rol_id) VALUES ?', [permisosRoles]);
    }

    req.flash('success', 'El rol <b>'+rol.nombre+'</b> ha sido editado correctamente');
    res.redirect('/roles');
})

module.exports = router;