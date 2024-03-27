const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new localStrategy({
    usernameField: 'correo',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, correo, password, done) => {
    const rows = await pool.query('SELECT * FROM Usuarios WHERE correoElec = ? AND activo = 1', [correo]);
    if (rows.length > 0){
        const user = rows[0];
        const validPass = await helpers.matchPassword(password, user.contrasena);
        if (validPass){
            done(null, user, req.flash('success', 'Bienvenido(a) ' + user.nombre + " " + user.apellido));
        } else{
            done(null, false, req.flash('error', 'Contraseña incorrecta...'));
        }
    } else{
        done(null, null, req.flash('error', 'El usuario no existe o no esta activo'));
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.usuarioId);
});

passport.deserializeUser( async (usuarioId, done) => {
    const rows = await pool.query('SELECT * FROM Usuarios WHERE usuarioId = ?', [usuarioId]);
    const user = rows[0];
    const permissions = await pool.query('SELECT CASE WHEN Permisos.empleado_id <> 1000 THEN Permisos.permisoId ELSE NULL END AS permisoId, CASE WHEN Permisos.empleado_id <> 1000 THEN Permisos.permiso ELSE NULL END AS permiso FROM (SELECT Usuarios.empleado_id AS empleado_id, Permisos.permisoId AS permisoId, Permisos.permiso AS permiso FROM Usuarios INNER JOIN Roles ON Usuarios.rol_id = Roles.rolId INNER JOIN PermisosRoles ON Roles.rolId = PermisosRoles.rol_id INNER JOIN Permisos ON PermisosRoles.permiso_id = Permisos.permisoId WHERE Usuarios.usuarioId = ? ORDER BY Permisos.permisoId) AS Permisos HAVING permisoId IS NOT NULL AND permiso IS NOT NULL;', [usuarioId]);
    user.permisos = permissions;
    done(null, user);
});