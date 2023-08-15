const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, async (req, res) =>{
    const users = await pool.query('SELECT * FROM usuarios');
    res.render('../views/users/allUsers', {users});
});

router.get('/add', isLoggedIn, (req, res) =>{
    res.render('../views/users/newUser');
});

router.get('/edit/:id', isLoggedIn, async(req, res) =>{
    const {id} = req.params;
    const users = await pool.query('SELECT * FROM usuarios WHERE usuarioId = ?', [id]);
    const user = users[0];
    res.render('../views/users/editUser', {user});
});

module.exports = router;