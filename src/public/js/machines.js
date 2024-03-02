function validarForm(form){
    let validated = false;
    form.on('submit', (event)=>{
        // Validacion del numero de serie
        const serialNumberInput = $('#serialnumber');
        serialNumberInput.removeClass('border-dark');
        if (serialNumberInput.val().length == 0) {
            serialNumberInput.removeClass('is-valid');
            serialNumberInput.addClass('is-invalid');
            $('#invalid-feedback-serialnumber').text('Por favor, agregue un número de serie');
        }else{
            serialNumberInput.removeClass('is-invalid');
            serialNumberInput.addClass('is-valid');
        };
        
        // Validacion de la marca
        const brandInput = $('#brand');
        brandInput.removeClass('border-dark');
        if (brandInput.val().length == 0) {
            brandInput.removeClass('is-valid');
            brandInput.addClass('is-invalid');
            $('#invalid-feedback-brand').text('Por favor, agregue una marca');
        }else{
            brandInput.removeClass('is-invalid');
            brandInput.addClass('is-valid');
        };

        // Validacion del nombre
        const nameInput = $('#name');
        nameInput.removeClass('border-dark');
        if (nameInput.val().length == 0) {
            nameInput.removeClass('is-valid');
            nameInput.addClass('is-invalid');
            $('#invalid-feedback-name').text('Por favor, agregue un nombre');
        }else{
            nameInput.removeClass('is-invalid');
            nameInput.addClass('is-valid');
        };

        // Validacion del tipo de cabezal
        const headTypeInput = $('#headtype');
        headTypeInput.removeClass('border-dark');
        headTypeInput.addClass('is-valid');

        // Validacion del numero de cabezales
        const headNumInput = $('#headnum');
        headNumInput.removeClass('border-dark');
        if (headNumInput.val().length == 0) {
            headNumInput.removeClass('is-valid');
            headNumInput.addClass('is-invalid');
            $('#invalid-feedback-headnum').text('Por favor, agregue un número de cabezales.');
        }else{
            if (headNumInput.val() >0 && headNumInput.val()<11){
                headNumInput.removeClass('is-invalid');
                headNumInput.addClass('is-valid');
            }else{
                headNumInput.removeClass('is-valid');
                headNumInput.addClass('is-invalid');
                $('#invalid-feedback-headnum').text('El número de cabezales debe ser mayor a 0 y menor a 11.');
            }
        };

        // Validacion de la velocidad
        const speedInput = $('#speed');
        speedInput.removeClass('border-dark');
        if (speedInput.val().length == 0) {
            speedInput.removeClass('is-valid');
            speedInput.addClass('is-invalid');
            $('#invalid-feedback-speed').text('Por favor, agregue una velocidad.');
        }else{
            if (speedInput.val() >0){
                speedInput.removeClass('is-invalid');
                speedInput.addClass('is-valid');
            }else{
                speedInput.removeClass('is-valid');
                speedInput.addClass('is-invalid');
                $('#invalid-feedback-speed').text('La velocidad debe ser mayor a 0.');
            }
        };

        // Velocidad del tipo de tinta
        const inkTypeInput = $('#inktype');
        inkTypeInput.removeClass('border-dark');
        inkTypeInput.addClass('is-valid');

        // Validacion de la extension del contacto del tecnico
        const extensionInput = $('#extension');
        extensionInput.removeClass('border-dark');
        extensionInput.addClass('is-valid');

        // Validacion del numero telefonico del tecnico
        const techContactInput = $('#techcontact')
        techContactInput.removeClass('border-dark');
        if (techContactInput.val().length === 0) {
            techContactInput.removeClass('is-valid');
            techContactInput.addClass('is-invalid');
            $('#invalid-feedback-techcontact').text('Por favor, agregue un número de contacto para el técnico');
        }else{
            if(techContactInput.val().length !== 10){
                techContactInput.removeClass('is-valid');
                techContactInput.addClass('is-invalid');
                $('#invalid-feedback-techcontact').text('El número de contacto debe tener 10 dígitos');
            }else{
                techContactInput.removeClass('is-invalid');
                techContactInput.addClass('is-valid');
            }
        };

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
    });
}

$(document).ready(function(){
    var table = new DataTable('#machines-table', {
        paging: false,
        info: false,
        padding: false,
        order: [],
        dom: '<"row pb-2"<"col-12 col-md-6 order-last order-md-first"<"float-start"f>><"col-12 col-md-6 order-first order-md-last"<"button-add-machine"B>>><"row"<"col-sm-12"tr>>',
        columnDefs: [
            {
                "orderable": false,
                "targets": 9
            }
        ],
        fnInitComplete: function(){
            // añadir boton para agregar roles
            const addRolebtn = $('#machines-add-button').clone().removeClass('d-none');
            $('div.button-add-machine').html(addRolebtn);
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });
    
    $('#machines-table tbody').on('click', '#btnExpandUsers', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const idMachine = $(this).val();
        if (row.child.isShown()) {
            $('div.machines-users-slider', row.child()).slideUp(function () {
                row.child.hide();
            });
        }else {
            $.ajax({
                type: 'POST',
                url: '/machines/listUsers',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idMachine: idMachine}),
                success: function(data){
                    const sourceAssignedUsers = $('#machines-users-expand').html();
                    const templateAssignedUsers = Handlebars.compile(sourceAssignedUsers);
                    const contextAssignedUsers = {
                        machine: data.machine,
                        assignedUsers: data.assignedUsers,
                        permissions: data.permissions
                    };
                    const htmlAssignedUsers = templateAssignedUsers(contextAssignedUsers);
                    row.child(htmlAssignedUsers, 'p-0' ).show();
                    $('div.machines-users-slider', row.child()).slideDown();

                    // crear tooltips para esta tabla
                    if ($('#machines-table tbody span[data-bs-toggle="tooltip"]').is(':not(:empty)')){
                        new bootstrap.Tooltip('#machines-table tbody', {selector: 'span[data-bs-toggle="tooltip"]'});
                    }
                }
            });
        }
    });

    validarForm($('#form-add-machine'));
    validarForm($('#form-edit-machine'));
});
