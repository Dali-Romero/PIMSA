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

hbs.registerHelper('formatNumber', function(n){
    return Number(n).toLocaleString();
});

hbs.registerHelper('formatNumberMeasure', function(n){
    if(Number.isInteger(n)){
        return Number(n)
    }else{
        return Number(Number.parseFloat(n).toFixed(3));
    }
});

hbs.registerHelper('formatDate', function(date){
    date = new Date(date);
    fecha = date.toLocaleDateString('es-mx', {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric'});
    return fecha;
});

hbs.registerHelper('formatDateShort', function(date){
    date = new Date(date);
    fecha = date.toLocaleDateString('es-mx', {year: 'numeric', month: '2-digit', day: '2-digit', hour:'numeric', minute: 'numeric'});
    return fecha;
});