function validarForm(form){
    let validated = false;
    form.on('submit', (event)=>{
        // Comprobamos las entradas

        // Comprobacion de las validaciones
        const nonvalidatedFields = $('.is-invalid');
        if (nonvalidatedFields.length === 0){
            validated = true;
        }

        // En caso de no estar validada no envia
        if (!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

$(document).ready(function(){
    validarForm($('#form-finish-cobranza'));
});