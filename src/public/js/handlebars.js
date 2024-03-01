Handlebars.registerHelper('equal', function(v1, v2, options){
    if (v1 === v2){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

Handlebars.registerHelper('equalNR', function(v1, v2, options){
    if (v1 == v2){
        return options.fn(this);
    } else{
        return options.inverse(this);
    }
});

Handlebars.registerHelper('formatNumber', function(v1, options){
    let num = Number.parseFloat(v1).toFixed(2);
    num = Number(num).toLocaleString();
    return num;
});

Handlebars.registerHelper('formatDate', function(v1, options){
    date = new Date(v1);
    fechaCotizacion = date.toLocaleDateString('es-mx', {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric'});
    return fechaCotizacion;
});

Handlebars.registerHelper('formatNumberMeasure', function(n){
    if(Number.isInteger(n)){
        return Number(n)
    }else{
        return Number(Number.parseFloat(n).toFixed(3));
    }
});

Handlebars.registerHelper('checkPermission', function (v1, v2, options){
    const permissions = v1;
    const allowed = permissions.find(function(object){
        return object.permiso == v2;
    });
    
    if (allowed) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})