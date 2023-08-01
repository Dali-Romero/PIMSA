const express = require('express');
const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

router.get('/', isLoggedIn, (req, res) =>{
    res.render('../views/products/allProducts');
});

router.get('/add', isLoggedIn, (req, res) =>{
    res.render('../views/products/addProduct');
});

module.exports = router;