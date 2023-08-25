function validarForm(form){
    let validated = false;
    form.on('submit', (event)=>{
        //Validacion del correo
        const correoInput = $('#correo');
        var validEmail =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        correoInput.removeClass('border-dark');
        if (correoInput.val().length == 0){
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-correo').text('Por favor, introduzca un correo.');
        } else if (validEmail.test(correoInput.val())){
            correoInput.removeClass('is-invalid');
            correoInput.addClass('is-valid');
        } else{
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-correo').text('No es un correo valido.');
        }

        //Validacion de la contraseña
        const passInput = $('#password');
        passInput.removeClass('border-dark');
        console.log('Revisando PASS');
        if (passInput.val().length == 0){
            passInput.removeClass('is-valid');
            passInput.addClass('is-invalid');
            $('#invalid-feedback-password').text('Por favor, introduzca la contraseña.');
        } else{
            passInput.removeClass('is-invalid');
            passInput.addClass('is-valid');
        }

        //Comprobacion de validaciones
        const nonvalidatedFields = $('.is-invalid');
        if (nonvalidatedFields.length === 0){
            validated = true;
        }

        //En caso de no estar validado no se envia
        if (!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    });
}

$(document).ready(function(){
    validarForm($('#form-login'));
})