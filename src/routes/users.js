const express = require('express');
const pool = require('../database');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { validateCreateUser, validateEditUser } = require('../lib/validators');
const { validationResult } = require('express-validator');


router.get('/', isLoggedIn, IsAuthorized('seeListUsers'), async (req, res) =>{
    const users = await pool.query('SELECT * FROM Usuarios');
    const roles = await pool.query('SELECT * FROM Roles');
    const empleados = await pool.query('SELECT * FROM Empleados');
    let activos = 0
    let inactivos = 0
    for(let i in users){
        if (users[i].activo){
            activos++;
        }else{
            inactivos++;
        }
    }
    res.render('../views/users/allUsers', {users, roles, empleados, activos, inactivos});
});

router.get('/add', isLoggedIn, IsAuthorized('addUsers'), async (req, res) =>{
    const roles = await pool.query('SELECT * FROM Roles WHERE activo = 1');
    const empleados = await pool.query('SELECT * FROM Empleados');
    res.render('../views/users/newUser', {roles, empleados});
});

router.post('/add', isLoggedIn, IsAuthorized('addUsers'), validateCreateUser(), async (req, res)=>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});

    // En caso de existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        const user = req.body;
        console.log(user);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.pass, salt);
        const correo = await pool.query('SELECT * FROM Usuarios WHERE correoElec = ?', [user.correo]);
        if (correo.length >= 1){
            const errorUser = user;
            const roles = await pool.query('SELECT * FROM Roles WHERE activo = 1');
            const empleados = await pool.query('SELECT * FROM Empleados');
            req.flash('error', 'El correo ya ha sido utilizado en otro usuario.');
            res.render('../views/users/newUser', {errorUser, roles, empleados});
        } else {
            const newUser = {
                nombre: user.nombre,
                apellido: user.apellido,
                correoElec: user.correo,
                activo: user.status,
                Empleado_id: user.empleado,
                Rol_id: user.rol,
                Contrasena: hash
            };
            pool.query('INSERT INTO Usuarios SET ?', [newUser]);
            req.flash('success', 'Usuario registrado con exito.');
            res.redirect('/users');
        }
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/users/add');
    }
    
});

router.get('/edit/:id', isLoggedIn, IsAuthorized('editUsers'), async(req, res) =>{
    const {id} = req.params;
    const users = await pool.query('SELECT * FROM Usuarios WHERE usuarioId = ?', [id]);
    const roles = await pool.query('SELECT * FROM Roles WHERE activo = 1');
    const empleados = await pool.query('SELECT * FROM Empleados');
    res.render('../views/users/editUser', {users: users[0], roles, empleados});
});

router.post('/edit/:id', isLoggedIn, IsAuthorized('editUsers'), validateEditUser(), async(req, res) =>{
    // Validacion de los campos enviados
    const resultadosValidacion = validationResult(req);
    const resultadosValidacionArray = resultadosValidacion.array({onlyFirstError: true});
    const {id} = req.params;

    // En caso de existir errores almacenar el registro
    if (resultadosValidacion.isEmpty()){
        const user = req.body;
        var editUser;
        if (user.pass != "--"){
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.pass, salt);
            editUser = {
                nombre: user.nombre,
                apellido: user.apellido,
                correoElec: user.correo,
                activo: user.status,
                Empleado_id: user.empleado,
                Rol_id: user.rol,
                Contrasena: hash
            }
        } else{
            editUser = {
                nombre: user.nombre,
                apellido: user.apellido,
                correoElec: user.correo,
                activo: user.status,
                Empleado_id: user.empleado,
                Rol_id: user.rol
            }
        }
        pool.query('UPDATE Usuarios SET ? WHERE usuarioId = ?', [editUser, id]);
        req.flash('success', 'Usuario actualizado con exito.');
        res.redirect('/users');
    } else{
        req.flash('validationErrors', resultadosValidacionArray);
        res.redirect('/users/edit/'+id);
    }
    
});

module.exports = router;