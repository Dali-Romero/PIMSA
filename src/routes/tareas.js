const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, async(req, res) =>{
    const tareas = await pool.query('SELECT * FROM ')
});