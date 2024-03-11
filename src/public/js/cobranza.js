function validarFormCobranza(form){
    let validated = false;
    form.on('submit', (event)=>{
        // Comprobamos Forma de pago
        const formaPago = $('#forma');
        formaPago.removeClass('border-dark');
        if (formaPago.val() == "none"){
            formaPago.removeClass('is-valid');
            formaPago.addClass('is-invalid');
            $('#invalid-feedback-forma-pago').text('Por favor, seleccione una opcion valida.');
        } else{
            formaPago.removeClass('is-invalid'); 
            formaPago.addClass('is-valid');
        }

        // Comprobamos Estatus pago
        const estatusInput = $('#pago');
        estatusInput.removeClass('border-dark');
        estatusInput.addClass('is-valid');

        // Comprobamos Fecha de liquidacion
        const fechaInput = $('#fecLiq');
        fechaInput.removeClass('border-dark');
        if (fechaInput.val().length == 0){
            fechaInput.removeClass('is-valid');
            fechaInput.addClass('is-invalid');
            $('#invalid-feedback-fecha').text('Por favor, especifique una fecha de pago.')
        } else{
            fechaInput.removeClass('is-invalid');
            fechaInput.addClass('is-valid');
        }

        // Comprobamos referencias
        const referenciaInput = $('#referencia');
        referenciaInput.removeClass('border-dark');
        referenciaInput.addClass('is-valid');

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
    validarFormCobranza($('#form-finish-cobranza'));
});