const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new localStrategy({
    usernameField: 'correo',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, correo, password, done) => {
    const rows = await pool.query('SELECT * FROM usuarios WHERE correoElec = ? AND activo == 1', [correo]);
    if (rows.length > 0){
        const user = rows[0];
        const validPass = await helpers.matchPassword(password, user.contrasena);
        if (validPass){
            done(null, user, req.flash('success_msg', 'Bienvenido(a) ' + user.nombre + " " + user.apellido));
        } else{
            done(null, false, req.flash('error_msg', 'Contraseña incorrecta...'));
        }
    } else{
        done(null, null, req.flash('error', 'El usuario no existe o no esta activo'));
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.usuarioId);
});

passport.deserializeUser( async (usuarioId, done) => {
    const rows = await pool.query('SELECT * FROM usuarios WHERE usuarioId = ?', [usuarioId]);
    done(null, rows[0]);
});