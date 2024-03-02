module.exports = {
    isLoggedIn(req, res, next){
        if (req.isAuthenticated()){
            return next();
        } else{
            return res.redirect('/login');
        }
    },

    isNotLoggedIn(req, res, next){
        if (!req.isAuthenticated()){
            return next();
        } else{
            return res.redirect('/');
        }
    },

    IsAuthorized(permission){
        return async function (req, res, next){
            const permissions = req.user.permisos;
            const allowed = permissions.find(function(object){
                return object.permiso == permission;
            });
            
            if (allowed) {
                return next();
            } else {
                return res.redirect('/roles/accessDenied');
            }
        }
    }
}