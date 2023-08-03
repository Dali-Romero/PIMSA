const hbs = require('handlebars');

hbs.registerHelper('equal', function(v1, v2, options){
    if (v1 === v2){
        console.log(v1 +' es igual a '+v2);
        return options.fn(this);
    } else{
        console.log(v1 + ' es diferente a ' + v2);
        return options.inverse(this);
    }
});