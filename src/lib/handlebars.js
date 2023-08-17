const hbs = require('handlebars');

hbs.registerHelper('equal', function(v1, v2, options){
    if (v1 === v2){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

hbs.registerHelper('equalNR', function(v1, v2, options){
    if (v1 == v2){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});