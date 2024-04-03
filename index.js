const express = require('express');
const morgan = require('morgan');
const {engine} = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const {database} = require('./src/keys.js');
const passport = require('passport');

// Initializations
const app = express();
require('./src/lib/passport.js');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./src/lib/handlebars.js')
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(session({
    secret: 'mysqlSession',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next)=>{
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.validationErrors = req.flash('validationErrors');
    next();
});


// Routes
app.use(require('./src/routes/index'));
app.use(require('./src/routes/login.js'));
app.use('/grupos/', require('./src/routes/grupos.js'));
app.use('/machines', require('./src/routes/machines.js'));
app.use('/products', require('./src/routes/products.js'));
app.use('/clients/', require('./src/routes/clients.js'));
app.use('/quotations', require('./src/routes/quotations.js'));
app.use('/users', require('./src/routes/users.js'));
app.use('/employees', require('./src/routes/employees.js'));
app.use('/roles', require('./src/routes/roles.js'));
app.use('/areas', require('./src/routes/areas.js'));
app.use('/orders', require('./src/routes/orders.js'));
app.use('/tareas', require('./src/routes/tareas.js'));
app.use('/dashboard', require('./src/routes/dashboard.js'));
app.use('/extask', require('./src/routes/extask.js'));
app.use('/cobranza', require('./src/routes/cobranza.js'));
app.use('/monitor', require('./src/routes/monitor.js'));
app.use('/processes', require('./src/routes/processes.js'));


// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting server
app.listen(app.get('port'), ()=>{
    console.log('Server on port ', app.get('port'));
});