const hbs = require('handlebars');
const {format, register} = require('timeago.js');

register('es_ES', (number, index, total_sec) => [
    ['justo ahora', 'ahora mismo'],
    ['hace %s segundos', 'en %s segundos'],
    ['hace 1 minuto', 'en 1 minuto'],
    ['hace %s minutos', 'en %s minutos'],
    ['hace 1 hora', 'en 1 hora'],
    ['hace %s horas', 'in %s horas'],
    ['hace 1 dia', 'en 1 dia'],
    ['hace %s dias', 'en %s dias'],
    ['hace 1 semana', 'en 1 semana'],
    ['hace %s semanas', 'en %s semanas'],
    ['1 mes', 'en 1 mes'],
    ['hace %s meses', 'en %s meses'],
    ['hace 1 año', 'en 1 año'],
    ['hace %s años', 'en %s años']
][index]);

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

hbs.registerHelper('greaterThan', function(v1, v2, options){
    if (Number(v1) > Number(v2)){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

hbs.registerHelper('equalOR', function(v1, v2, v3, options){
    if (v1 === v2 || v1 === v3){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

hbs.registerHelper('equalORThree', function(v1, v2, v3, v4, options){
    if (v1 === v2 || v1 === v3 || v1 === v4){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

hbs.registerHelper('formatNumber', function(n){
    let num = Number.parseFloat(n).toFixed(2);
    num = Number(num).toLocaleString(undefined, {minimumFractionDigits: 2});
    return num;
});

hbs.registerHelper('formatNumberMeasure', function(n){
    if(Number.isInteger(n)){
        return Number(n)
    }else{
        return Number(Number.parseFloat(n).toFixed(3));
    }
});

hbs.registerHelper('formatNumberAmount', function(n){
    let num = Number(n).toLocaleString();
    return num;
});

hbs.registerHelper('formatDate', function(date){
    date = new Date(date);
    let zonaHorariaMexico = 'America/Mexico_City';
    fecha = date.toLocaleDateString('es-mx', {timeZone: zonaHorariaMexico, year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric'});
    return fecha;
});

hbs.registerHelper('formatDateShort', function(date){
    date = new Date(date);
    let zonaHorariaMexico = 'America/Mexico_City';
    fecha = date.toLocaleDateString('es-mx', {timeZone: zonaHorariaMexico, year: 'numeric', month: '2-digit', day: '2-digit', hour:'numeric', minute: 'numeric'});
    return fecha;
});

hbs.registerHelper('formatDateOnlyDate', function(date){
    dateUtc = new Date(date);
    let zonaHorariaMexico = 'America/Mexico_City';
    fecha = dateUtc.toLocaleDateString('es-mx', {timeZone: zonaHorariaMexico, year: 'numeric', month: '2-digit', day: '2-digit'});
    return fecha;
});

hbs.registerHelper('timeago', function(timestamp){
    return format(timestamp, 'es_ES');
});

hbs.registerHelper('checkPermission', function (v1, v2, options){
    const permissions = v1;
    const allowed = permissions.find(function(object){
        return object.permiso == v2;
    });
    
    if (allowed) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

hbs.registerHelper('checkPermissionOR', function (v1, v2, v3, options){
    const permissions = v1;
    const allowed = permissions.find(function(object){
        return object.permiso == v2 || object.permiso == v3;
    });
    
    if (allowed) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})

hbs.registerHelper('checkPermissionORThree', function (v1, v2, v3, v4, options){
    const permissions = v1;
    const allowed = permissions.find(function(object){
        return object.permiso == v2 || object.permiso == v3 || object.permiso == v4;
    });
    
    if (allowed) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})

hbs.registerHelper('formatDateEspanol', function(date){
    date = new Date(date);
    let zonaHorariaMexico = 'America/Mexico_City';
    fecha = date.toLocaleDateString('es-mx', {timeZone: zonaHorariaMexico, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
    return fecha;
});

hbs.registerHelper('formatDateString', function(date){
    date = new Date(date);
    let zonaHorariaMexico = 'America/Mexico_City';
    fecha = date.toLocaleDateString('en-CA', {timeZone: zonaHorariaMexico});
    return fecha;
});