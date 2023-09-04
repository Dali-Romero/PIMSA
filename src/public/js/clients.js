function validar(form){
    let validated = false;
    form.on('submit', (event)=>{
        //validacion de la fecha
        const dateInput = $('#date');
        dateInput.removeClass('border-dark');
        dateInput.addClass('is-valid');

        //validacion del ejecutivo
        const executiveInput = $('#executive');
        executiveInput.removeClass('border-dark');
        executiveInput.addClass('is-valid');

        //validacion del grupo
        const groupInput = $('#group');
        groupInput.removeClass('border-dark');
        groupInput.addClass('is-valid');

        //validacion del nombre comercial
        const tradeNameInput = $('#tradename');
        tradeNameInput.removeClass('border-dark');
        if (tradeNameInput.val().length == 0){
            tradeNameInput.removeClass('is-valid');
            tradeNameInput.addClass('is-invalid');
            $('invalid-feedback-tradename').text('Por favor, agregue un nombre comercial');
        }else{
            tradeNameInput.removeClass('is-invalid');
            tradeNameInput.addClass('is-valid');
        };

        //validacion del contacto
        const contactInput = $('#contact');
        contactInput.removeClass('border-dark');
        if (contactInput.val().length == 0){
            contactInput.removeClass('is-valid');
            contactInput.addClass('is-invalid');
            $('#invalid-feedback-contact').text('Por favor, ingresa el contacto');
        }else{
            contactInput.removeClass('is-invalid');
            contactInput.addClass('is-valid');
        };

        //validacion de la razon social
        const companyNameInput = $('#companyname');
        companyNameInput.removeClass('border-dark');
        if (companyNameInput.val().length == 0){
            companyNameInput.removeClass('is-valid');
            companyNameInput.addClass('is-invalid');
            $('#invalid-feedback-companyname').text('Por favor, ingresa razon social');
        }else{
            companyNameInput.removeClass('is-invalid');
            companyNameInput.addClass('is-valid');
        };

        //validacion del RFC
        const rfcInput = $('#rfc');
        rfcInput.removeClass('border-dark');
        if (rfcInput.val().length == 0) {
            rfcInput.removeClass('is-valid');
            rfcInput.addClass('is-invalid');
            $('#invalid-feedback-rfc').text('Por favor agregue el RFC');
        }else{
            if (rfcInput.val().length >11 && rfcInput.val().length<14){
                rfcInput.removeClass('is-invalid');
                rfcInput.addClass('is-valid');
            }else{
                rfcInput.removeClass('is-valid');
                rfcInput.addClass('is-invalid');
                $('#invalid-feedback-rfc').text('El RFC debe de contener de 12 a 13 caracteres');
            }
        };

        //validacion de la calle
        const streetInput = $('#street');
        streetInput.removeClass('border-dark');
        if (streetInput.val().length == 0){
            streetInput.removeClass('is-valid');
            streetInput.addClass('is-invalid');
            $('#invalid-feedback-street').text('Por favor, ingresa la calle');
        }else{
            streetInput.removeClass('is-invalid');
            streetInput.addClass('is-valid');
        };

        //validacion del numero exterior
        const outerNumberInput = $('#outernumber');
        outerNumberInput.removeClass('border-dark');
        if (outerNumberInput.val().length == 0){
            outerNumberInput.removeClass('is-valid');
            outerNumberInput.addClass('is-invalid');
            $('#invalid-feedback-outernumber').text('Por favor, ingresa el numero exterior');
        }else{
            outerNumberInput.removeClass('is-invalid');
            outerNumberInput.addClass('is-valid');
        };

        //validacion del numero interior
        const innerNumberInput = $('#innernumber');
        innerNumberInput.removeClass('border-dark');
        innerNumberInput.addClass('is-valid');

        //validacion de la colonia
        const colonyInput = $('#colony');
        colonyInput.removeClass('border-dark');
        if (colonyInput.val().length == 0){
            colonyInput.removeClass('is-valid');
            colonyInput.addClass('is-invalid');
            $('#invalid-feedback-colony').text('Por favor, ingresa la colonia');
        }else{
            colonyInput.removeClass('is-invalid');
            colonyInput.addClass('is-valid');
        };

        //validacion del CP
        const cpInput = $('#cp');
        cpInput.removeClass('border-dark');
        if(cpInput.val().length == 0){
            cpInput.removeClass('is-valid');
            cpInput.addClass('is-invalid');
            $('#invalid-feedback-cp').text('Por favor, ingresa el Código Postal');
        }else{
            if(cpInput.val().length !== 5){
                cpInput.removeClass('is-valid');
                cpInput.addClass('is-invalid');
                $('#invalid-feedback-cp').text('El código postal debe tener 5 dígitos');
            }else{
                cpInput.removeClass('is-invalid');
                cpInput.addClass('is-valid');
            }
        };

        //validacion del estado
        const stateInput = $('#state');
        stateInput.removeClass('border-dark');
        if (stateInput.val().length == 0){
            stateInput.removeClass('is-valid');
            stateInput.addClass('is-invalid');
            $('#invalid-feedback-state').text('Por favor, ingresa el estado');
        }else{
            stateInput.removeClass('is-invalid');
            stateInput.addClass('is-valid');
        };

        //validacion de la ciudad
        const cityInput = $('#city');
        cityInput.removeClass('border-dark');
        if (cityInput.val().length == 0){
            cityInput.removeClass('is-valid');
            cityInput.addClass('is-invalid');
            $('#invalid-feedback-city').text('Por favor, ingresa la ciudad');
        }else{
            cityInput.removeClass('is-invalid');
            cityInput.addClass('is-valid');
        };

        //validacion de la extension
        const extensionInput = $('#extension');
        extensionInput.removeClass('border-dark');
        extensionInput.addClass('is-valid');

        //validacion del telefono
        const telephoneInput = $('#telephone')
        telephoneInput.removeClass('border-dark');
        if (telephoneInput.val().length === 0) {
            telephoneInput.removeClass('is-valid');
            telephoneInput.addClass('is-invalid');
            $('#invalid-feedback-telephone').text('Por favor, agregue un número de contacto');
        }else{
            if(telephoneInput.val().length !== 10){
                telephoneInput.removeClass('is-valid');
                telephoneInput.addClass('is-invalid');
                $('#invalid-feedback-telephone').text('El número de contacto debe tener 10 dígitos');
            }else{
                telephoneInput.removeClass('is-invalid');
                telephoneInput.addClass('is-valid');
            }
        };

        //validacion del celular
        const cellInput = $('#cell')
        cellInput.removeClass('border-dark');
        if (cellInput.val().length === 0) {
            cellInput.removeClass('is-valid');
            cellInput.addClass('is-invalid');
            $('#invalid-feedback-cell').text('Por favor, agregue un número de celular');
        }else{
            if(cellInput.val().length !== 10){
                cellInput.removeClass('is-valid');
                cellInput.addClass('is-invalid');
                $('#invalid-feedback-cell').text('El número de celular debe tener 10 dígitos');
            }else{
                cellInput.removeClass('is-invalid');
                cellInput.addClass('is-valid');
            }
        };

        //validacion del correo electronico
        const correoInput = $('#email');
        correoInput.removeClass('border-dark');
        if (correoInput.val().length == 0){
            correoInput.removeClass('is-valid');
            correoInput.addClass('is-invalid');
            $('#invalid-feedback-email').text('Por favor, ingresa correo');
        }else{
            correoInput.removeClass('is-invalid');
            correoInput.addClass('is-valid');
        };

        //validacion del correo alterno
        const correoAltInput = $('#emailAlt');
        correoAltInput.removeClass('border-dark');
        correoAltInput.addClass('is-valid');

        //validacion del limite de credito
        const creditLimitInput = $('#creditlimit');
        creditLimitInput.removeClass('border-dark');
        if (creditLimitInput.val().length == 0){
            creditLimitInput.removeClass('is-valid');
            creditLimitInput.addClass('is-invalid');
            $('#invalid-feedback-creditlimit').text('Por favor, ingresa el limite de credito');
        }else{
            creditLimitInput.removeClass('is-invalid');
            creditLimitInput.addClass('is-valid');
        };

        //validacion de los dias de credito
        const creditdaystInput = $('#creditdays');
        creditdaystInput.removeClass('border-dark');
        if (creditdaystInput.val().length == 0){
            creditdaystInput.removeClass('is-valid');
            creditdaystInput.addClass('is-invalid');
            $('#invalid-feedback-creditdays').text('Por favor, ingresa los días de credito');
        }else{
            creditdaystInput.removeClass('is-invalid');
            creditdaystInput.addClass('is-valid');
        };

        //validacion del descuento
        const descuentoInput = $('#descuento');
        descuentoInput.removeClass('border-dark');
        descuentoInput.addClass('is-valid');

        //validacion de las observaciones
        const observacionesInput = $('#observaciones');
        observacionesInput.removeClass('border-dark');
        observacionesInput.addClass('is-valid');

        //comprobacion de las validaciones
        const nonvalidateFields = $('.is-invalid');
        if (nonvalidateFields.length === 0){
            validated = true;
        }

        //en caso de no estar validado no se envia
        if (!validated){
            event.preventDefault()
            event.stopPropagation()
        }
    });
}

$(document).ready(function(){
    
    validar($('#form-add-client'));
    //validar($('#form-edit-client'));
});