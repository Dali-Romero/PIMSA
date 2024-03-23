function validarFormProducts(form){
    let validated = false;
    form.on('submit', (event)=>{
        //Validacion del nombre
        const nombreInput = $('#nombre');
        nombreInput.removeClass('border-dark');
        if (nombreInput.val().length == 0){
            nombreInput.removeClass('is-valid');
            nombreInput.addClass('is-invalid');
            $('#invalid-feedback-nombre').text('Por favor, agregue un nombre de producto.');
        } else{
            nombreInput.removeClass('is-invalid');
            nombreInput.addClass('is-valid');
        };


        //Validacion del precio
        const precioInput = $('#precio');
        precioInput.removeClass('border-dark'); 
        if (precioInput.val().length == 0){
            precioInput.removeClass('is-valid');
            precioInput.addClass('is-invalid');
            $('#invalid-feedback-precio').text('Por favor, agregue un precio al producto.');
        } else{
            precioInput.removeClass('is-invalid');
            precioInput.addClass('is-valid');
        };


        //Validacion de porcentaje
        const porcentajeInput = $('#porcentaje');
        porcentajeInput.removeClass('border-dark');
        if (porcentajeInput.val().length == 0){
            porcentajeInput.removeClass('is-valid');
            porcentajeInput.addClass('is-invalid');
            $('#invalid-feedback-porcentaje').text('Por favor, agregue un descuento al producto.');
        } else if ((parseInt(porcentajeInput.val()) <= 100) && (parseInt(porcentajeInput.val()) >= 0)){
            porcentajeInput.removeClass('is-invalid');
            porcentajeInput.addClass('is-valid');
        } else{
            porcentajeInput.removeClass('is-valid');
            porcentajeInput.addClass('is-invalid');
            $('#invalid-feedback-porcentaje').text('El valor de descuento debe estar entre 0 y 100.');
        };


        //Validacion de descripcion
        const descripcionInput = $('#descripcion');
        descripcionInput.removeClass('border-dark');
        if (descripcionInput.val().length == 0){
            descripcionInput.removeClass('is-valid');
            descripcionInput.addClass('is-invalid');
            $('#invalid-feedback-descripcion').text('Por favor, agregue una descripcion al producto.');
        } else{
            descripcionInput.removeClass('is-invalid');
            descripcionInput.addClass('is-valid');
        }


        //Comprobacion unidad de medida
        const unidadField = $('#unidadMedida');
        unidadField.removeClass('border-dark');
        unidadField.addClass('is-valid');


        //Comprobacion proceso asociado
        const procesoField = $('#proceso');
        procesoField.removeClass('border-dark');
        const selectElement = procesoField[0];
        if (selectElement.options.length === 0){
            procesoField.removeClass('is-valid');
            procesoField.addClass('is-invalid');
            $('#invalid-feedback-proceso').text('Por favor, seleccione un proceso.');
        } else{
            procesoField.removeClass('is-invalid');
            procesoField.addClass('is-valid'); 
        }
        

        // Comprobacion de las validaciones
        const nonvalidatedFields = $('.is-invalid');
        if (nonvalidatedFields.length === 0){
            validated = true;
        }


        // En caso de no estar validado no se envia
        if (!validated){
            event.preventDefault()
            event.stopPropagation()
        }
    })
}

$(document).ready(function(){
    validarFormProducts($('#form-add-product'));
    validarFormProducts($('#form-edit-product'));
});