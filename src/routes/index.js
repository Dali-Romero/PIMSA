const express = require('express');
const { isLoggedIn } = require('../lib/auth');
const router = express.Router();

//const { isLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn,  (req, res)=>{
    res.render('../views/partials/navigations.hbs');
});

module.exports = router;