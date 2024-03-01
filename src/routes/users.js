const express = require('express');
const pool = require('../database');
const { isLoggedIn, IsAuthorized } = require('../lib/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();


router.get('/', isLoggedIn, IsAuthorized('seeListUsers'), async (req, res) =>{
    const users = await pool.query('SELECT * FROM usuarios');
    const roles = await pool.query('SELECT * FROM roles');
    const empleados = await pool.query('SELECT * FROM empleados');
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
    const roles = await pool.query('SELECT * FROM roles WHERE activo = 1');
    const empleados = await pool.query('SELECT * FROM empleados');
    res.render('../views/users/newUser', {roles, empleados});
});

router.post('/add', isLoggedIn, IsAuthorized('addUsers'), async (req, res)=>{
    const user = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.pass, salt);
    const correo = await pool.query('SELECT * FROM usuarios WHERE correoElec = ?', [user.correo]);
    if (correo.length >= 1){
        const errorUser = user;
        const roles = await pool.query('SELECT * FROM roles WHERE activo = 1');
        const empleados = await pool.query('SELECT * FROM empleados');
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
        pool.query('INSERT INTO usuarios SET ?', [newUser]);
        req.flash('success', 'Usuario registrado con exito.');
        res.redirect('/users');
    }
});

router.get('/edit/:id', isLoggedIn, IsAuthorized('editUsers'), async(req, res) =>{
    const {id} = req.params;
    const users = await pool.query('SELECT * FROM usuarios WHERE usuarioId = ?', [id]);
    const roles = await pool.query('SELECT * FROM roles WHERE activo = 1');
    const empleados = await pool.query('SELECT * FROM empleados');
    res.render('../views/users/editUser', {user: users[0], roles, empleados});
});

router.post('/edit/:id', isLoggedIn, IsAuthorized('editUsers'), async(req, res) =>{
    const user = req.body;
    const {id} = req.params;
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
    pool.query('UPDATE usuarios SET ? WHERE usuarioId = ?', [editUser, id]);
    req.flash('success', 'Usuario actualizado con exito.');
    res.redirect('/users');
});

module.exports = router;