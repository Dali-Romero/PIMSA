function validarFormUsers(form){
    let validated = false;
    form.on('submit', (event)=>{
        //Validacion de nombre
        const nombreInput = $('#nombre');
        nombreInput.removeClass('border-dark');
        if (nombreInput.val().length <= 2){
            nombreInput.removeClass('is-valid');
            nombreInput.addClass('is-invalid');
            $('#invalid-feedback-nombre').text('Por favor, agregue un nombre de usuario.');
        } else {
            nombreInput.removeClass('is-invalid');
            nombreInput.addClass('is-valid');
        };

        //Validacion del correo
        const correoInput = $('#correo');
        if (document.getElementById('mailUsed') !== null){
            const warningMessage = $('#mailUsed');
            warningMessage.addClass('d-none');
        }
        correoInput.removeClass('border-dark');
        var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        if (correoInput.val().length <= 2){
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-correo').text('Por favor, agregue un correo electronico.');
        } else if (validEmail.test(correoInput.val())){
            correoInput.removeClass('is-invalid');
            correoInput.addClass('is-valid');
        } else {
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-correo').text('No es un correo valido.');
        };

        //Validacion apellido
        const apellidoInput = $('#apellido');
        apellidoInput.removeClass('border-dark');
        if (apellidoInput.val().length <= 2){
            apellidoInput.removeClass('is-valid');
            apellidoInput.addClass('is-invalid');
            $('#invalid-feedback-apellido').text('Por favor, agregue un apellido para el usuario.');
        } else {
            apellidoInput.removeClass('is-invalid');
            apellidoInput.addClass('is-valid');
        };

        //Verificacion de contraseña
        const passInput = $('#pass');
        passInput.removeClass('border-dark');
        if (passInput.val().length < 2){
            passInput.removeClass('is-valid');
            passInput.addClass('is-invalid');
            $('#invalid-feedback-pass').text('Por favor, agregue una contraseña al usuario.');
        } else{
            passInput.removeClass('is-invalid');
            passInput.addClass('is-valid');
        };

        //Verificacion de contraseña confirmar
        const confimPassInput = $('#confirmPass');
        confimPassInput.removeClass('border-dark');
        if (passInput.val() != confimPassInput.val()){
            confimPassInput.removeClass('is-valid');
            confimPassInput.addClass('is-invalid');
            $('#invalid-feedback-confirmPass').text('Las contraseñas deben ser las mismas.');
        } else {
            confimPassInput.removeClass('is-invalid');
            confimPassInput.addClass('is-valid');
        };

        // Velocidad del tipo de tinta
        const rolInput = $('#rol');
        rolInput.removeClass('border-dark');
        rolInput.addClass('is-valid');

        // Validacion de la extension del contacto del tecnico
        const empleadoInput = $('#empleado');
        empleadoInput.removeClass('border-dark');
        empleadoInput.addClass('is-valid');

        // Validacion de la clave de terceros para enviar cotizaciones por correo
        const llaveAcceso = $('#thirdPartyKey');
        const llaveAccesoMensajeValidacion = $('#invalid-feedback-thirdPartyKey');
        llaveAcceso.removeClass('border-dark');
        if (llaveAcceso.val().trim().length === 0) {
            llaveAcceso.removeClass('is-valid');
            llaveAcceso.addClass('is-invalid');
            llaveAccesoMensajeValidacion.text('Por favor, agregue una clave de acceso');
        }else if (llaveAcceso.val().trim().length < 1 || llaveAcceso.val().trim().length > 20){
            llaveAcceso.removeClass('is-valid');
            llaveAcceso.addClass('is-invalid');
            llaveAccesoMensajeValidacion.text('La clave de acceso debe contener entre 1 y 20 caracteres');
        }else{
            llaveAcceso.removeClass('is-invalid');
            llaveAcceso.addClass('is-valid');
        };

        // Comprobacion de las validaciones
        const nonvalidatedFields = $('.is-invalid');
        if (nonvalidatedFields.length === 0){
            validated = true;

            if ($('#thirdPartyKey').is(':disabled')) {
                $('#thirdPartyKey').prop('disabled', false);
            }
        }

        // En caso de no estar validado no se envia
        if (!validated){
            event.preventDefault()
            event.stopPropagation()
        }
    });
}

$(document).ready(function(){
    validarFormUsers($('#form-add-user'));
    validarFormUsers($('#form-edit-user'));

    // habilitar campo para la clave de terceros (enviar cotizaciones mediante el email del usuario)
    $('#thirdPartyKeyCheckop1').on('click', ()=>{
        $('#thirdPartyKey').prop('disabled', false);
        $('#thirdPartyKey').val('');
        $('#thirdPartyKey').focus();
    });

    // desabilitar campo para la clave de terceros (enviar cotizaciones mediante el email del usuario)
    $('#thirdPartyKeyCheckop2').on('click', ()=>{
        $('#thirdPartyKey').prop('disabled', true);
        $('#thirdPartyKey').val('Sin clave');
    });
});