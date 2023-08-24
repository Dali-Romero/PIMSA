const express = require('express');
const morgan = require('morgan');
const {engine} = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const {database} = require('./keys.js');
const passport = require('passport');

// Initializations
const app = express();
require('./lib/passport.js');

// Settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars.js')
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
app.use(flash());

// Global variables
app.use((req, res, next)=>{
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// Routes
app.use(require('./routes/index'));
app.use(require('./routes/login'));
app.use('/grupos/', require('./routes/grupos'));
app.use('/machines', require('./routes/machines'));
app.use('/products', require('./routes/products'));
app.use('/quotations', require('./routes/quotations'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting server
app.listen(app.get('port'), ()=>{
    console.log('Server on port ', app.get('port'));
});