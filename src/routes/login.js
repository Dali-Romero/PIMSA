const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/login', isNotLoggedIn, (req, res) =>{
    res.render('Login/Login');
});

router.post('/login', (req, res, next) =>{
    passport.authenticate('local.login',{
        successRedirect: '/fin',
        failureRedirect: '/login',
        failureFlash: true
    }) (req, res, next);
});

router.get('/fin', isLoggedIn, (req, res) =>{
    res.send('Inicio correcto');
});

router.get('/genPass', async (req, res) =>{
    const pass = '123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);
    console.log(hash);
    res.send(hash);
});

router.get('/Logout', isLoggedIn, (req, res) => {
    req.logOut( (err) =>{
        if (err){
            req.flash('error_msg', 'Error en logout...');
            console.log(err);
            return next(err);
        }
        res.redirect('/login');
    });
});



module.exports = router;