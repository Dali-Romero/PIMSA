function validateRolesForm(form){
    let validated = false;
    form.on('submit', function(event){
        // role name field validation
        const patternNameRole = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const nameRole = $('#rolename');
        const invalidFeedbackNameRole = $('#invalid-feedback-rolename');
        nameRole.removeClass('border-dark');
        if (nameRole.val().length === 0) {
            nameRole.removeClass('is-valid');
            nameRole.addClass('is-invalid');
            invalidFeedbackNameRole.text('Por favor, agregue un nombre');
        }else if (patternNameRole.test(nameRole.val())){
            nameRole.removeClass('is-valid');
            nameRole.addClass('is-invalid');
            invalidFeedbackNameRole.text('El nombre del rol debe contener únicamente letras');
        }else if (nameRole.val().length < 1 || nameRole.val().length > 20){
            nameRole.removeClass('is-valid');
            nameRole.addClass('is-invalid');
            invalidFeedbackNameRole.text('El nombre del rol debe contener entre 1 y 20 caracteres');
        }else{
            nameRole.removeClass('is-invalid');
            nameRole.addClass('is-valid');
        };

        // role description field validation
        const patternDescRole = /[^a-zA-ZÀ-ÿ0-9\sñÑ]/;
        const descRole = $('#roledescription');
        const invalidFeedbackDescRole = $('#invalid-feedback-roledescription');
        descRole.removeClass('border-dark');
        if (descRole.val().length === 0) {
            descRole.removeClass('is-valid');
            descRole.addClass('is-invalid');
            invalidFeedbackDescRole.text('Por favor, agregue una descripción');
        }else if (patternDescRole.test(descRole.val())){
            descRole.removeClass('is-valid');
            descRole.addClass('is-invalid');
            invalidFeedbackDescRole.text('La descripción del rol debe contener únicamente letras');
        }else if (descRole.val().length < 1 || descRole.val().length > 40){
            descRole.removeClass('is-valid');
            descRole.addClass('is-invalid');
            invalidFeedbackDescRole.text('La descripción del rol debe contener entre 1 y 40 caracteres');
        }else{
            descRole.removeClass('is-invalid');
            descRole.addClass('is-valid');
        };

        // role permissions select validation
        const permissions = $('input[name="permissions"][type="checkbox"]:checked');
        const invalidFeedbackPermissions = $('#invalid-feedback-permissions');
        if (permissions.length === 0){
            invalidFeedbackPermissions.removeClass('is-valid');
            invalidFeedbackPermissions.addClass('is-invalid');
            invalidFeedbackPermissions.removeClass('text-success');
            invalidFeedbackPermissions.addClass('text-danger');
            invalidFeedbackPermissions.text('Por favor, seleccione un permiso');
        }else{
            invalidFeedbackPermissions.removeClass('is-invalid');
            invalidFeedbackPermissions.addClass('is-valid');
            invalidFeedbackPermissions.removeClass('text-danger');
            invalidFeedbackPermissions.addClass('text-success');
            invalidFeedbackPermissions.text('¡Perfecto!');
        }

        // Checking the validations
        const nonValidatedFields = $('.is-invalid');
        if (nonValidatedFields.length !== 0){
            validated = false;
        }else{
            validated = true;
        }

        // avoid default form behavior
        if(!validated){
            event.preventDefault();
            event.stopPropagation();
        }
    })
}

$(document).ready(function(){
    // ------------------------------- List file -------------------------------
    const table = new DataTable('#roles-table', {
        paging: false,
        info: false,
        padding: false,
        order: [],
        columnDefs: [
            {
                "orderable": false,
                "targets": 5
            }
        ],
        dom: '<"row pb-2"<"col-12 col-md-6 order-last order-md-first"<"float-start"f>><"col-12 col-md-6 order-first order-md-last"<"button-add-role"B>>><"row"<"col-sm-12"tr>>',
        fnInitComplete: function(){
            // añadir boton para agregar roles
            const addRolebtn = $('#roles-add-button').clone().removeClass('d-none');
            $('div.button-add-role').html(addRolebtn);
        },
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });

    $('#roles-table tbody').on('click', '#btnExpandAssignedUsers', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const idRole = $(this).val();
        if (tr.hasClass('PermissionsIsShowing')) {
            row.child.hide();
            tr.removeClass('PermissionsIsShowing');
            tr.find('button#btnExpandPermissions').removeClass('active');
        }
        if (row.child.isShown()) {
            $('div.roles-users-slider', row.child()).slideUp(function () {
                row.child.hide();
                tr.removeClass('UsersIsShowing');
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/roles/listAssignedUsers',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idRole: idRole}),
                success: function(data){
                    const sourceAssignedUsers = $('#roles-users-expand').html();
                    const templateAssignedUsers = Handlebars.compile(sourceAssignedUsers);
                    const contextAssignedUsers = {
                        assignedUsers: data.usuariosAsignados,
                        role: data.rol,
                        permisos: data.permisos
                    };
                    const htmlAssignedUsers = templateAssignedUsers(contextAssignedUsers);
                    row.child(htmlAssignedUsers, 'p-0' ).show();
                    $('div.roles-users-slider', row.child()).slideDown();
                    tr.addClass('UsersIsShowing');

                    // crear tooltips para esta tabla
                    if ($('#roles-table tbody span[data-bs-toggle="tooltip"]').is(':not(:empty)')){
                        new bootstrap.Tooltip('#roles-table tbody', {selector: 'span[data-bs-toggle="tooltip"]'});
                    }
                }
            });
        }
    });

    $('#roles-table tbody').on('click', '#btnExpandPermissions', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);
        const idRole = $(this).val();
        if (tr.hasClass('UsersIsShowing')) {
            row.child.hide();
            tr.removeClass('UsersIsShowing');
            tr.find('button#btnExpandAssignedUsers').removeClass('active');
        }
        if (row.child.isShown()) {
            $('div.roles-permissions-slider', row.child()).slideUp(function () {
                row.child.hide();
                tr.removeClass('PermissionsIsShowing');
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/roles/listPermissions',
                headers: {'Content-Type': 'application/json'},
                data: JSON.stringify({idRole: idRole}),
                success: function(data){
                    const sourcePermissions = $('#roles-permissions-expand').html();
                    const templatePermissions = Handlebars.compile(sourcePermissions);
                    const contextPermissions = {
                        permissions: data.permisos,
                        role: data.rol
                    };
                    const htmlPermissions = templatePermissions(contextPermissions);
                    row.child(htmlPermissions, 'p-0' ).show();
                    $('div.roles-permissions-slider', row.child()).slideDown();
                    tr.addClass('PermissionsIsShowing');
                }
            });
        }
    });

    // crear todas las tooltips
    if ($('body span[data-bs-toggle="tooltip"]').is(':not(:empty)')){
        new bootstrap.Tooltip('body', {selector: 'span[data-bs-toggle="tooltip"]'});
    }

    // ------------------------------- Add file -------------------------------
    // check/uncheck all permissions
    $('#selectAllRoles').on('change', function(){
        if ($(this).is(':checked')){
            const permisos = $('input[name="permissions"][type="checkbox"]:not(input[name="permissions"][type="checkbox"][value="34"], input[name="permissions"][type="checkbox"][value="35"])');
            permisos.prop('checked', true);

            permisos.each(function(){
                if ($(this).val() != 36 && $(this).val() != 37 && $(this).val() != 38 && $(this).val() != 39) {
                    $(this).parents().eq(2).children().eq(0).children().eq(0).html('<i class="bi bi-eye-fill" style="font-size: 14px;"></i> <i class="bi bi-plus-circle" style="font-size: 14px;"></i> <i class="bi bi-pencil-square" style="font-size: 14px;"></i>');
                }
            })

            if ($('input[name="permissions"][type="checkbox"][value="34"]').is(':checked')) {
                $('input[name="permissions"][type="checkbox"][value="35"]').prop('checked', false);
            } else if ($('input[name="permissions"][type="checkbox"][value="35"]').is(':checked')) {
                $('input[name="permissions"][type="checkbox"][value="34"]').prop('checked', false);
            } else {
                $('input[name="permissions"][type="checkbox"][value="34"]').parents().eq(2).children().eq(0).children().eq(0).text('E.D.V');
                $('input[name="permissions"][type="checkbox"][value="34"]').prop('checked', true);
            }

        }else{
            const permisos = $('input[name="permissions"][type="checkbox"]');
            permisos.prop('checked', false);
            
            permisos.each(function(){
                if ($(this).val() != 36 && $(this).val() != 37 && $(this).val() != 38 && $(this).val() != 39) {
                    $(this).parents().eq(2).children().eq(0).children().eq(0).text('');
                }
            })
        }
    });

    // validate that a single task is marked
    $('input[name="permissions"][type="checkbox"][value="34"]').on('click', function(){
        if ($(this).is(':checked')) {
            $('input[name="permissions"][type="checkbox"][value="35"]').prop('checked', false);
        }
    });

    $('input[name="permissions"][type="checkbox"][value="35"]').on('click', function(){
        if ($(this).is(':checked')) {
            $('input[name="permissions"][type="checkbox"][value="34"]').prop('checked', false);
        }
    });

    // include the nomenclature of permissions by section
    $('input[name="permissions"][type="checkbox"]').on('click', function(){
        if ($(this).val() != 36 && $(this).val() != 37 && $(this).val() != 38 && $(this).val() != 39){
            const permisos_seleccionados = $(this).parents().eq(2).children().eq(1).children().find('input[name="permissions"][type="checkbox"]:checked');
            const permisos_span = $(this).parents().eq(2).children().eq(0).children().eq(0);
            let permisos_nomenclatura = '';
        
            permisos_seleccionados.each(function(){
                if ($(this).siblings().text() == 'Ver') {
                    permisos_nomenclatura += '<i class="bi bi-eye-fill" style="font-size: 14px;"></i> ';
                } else if ($(this).siblings().text() == 'Agregar') {
                    permisos_nomenclatura += '<i class="bi bi-plus-circle" style="font-size: 14px;"></i> ';
                } else if ($(this).siblings().text() == 'Editar') {
                    permisos_nomenclatura += '<i class="bi bi-pencil-square" style="font-size: 14px;"></i>';
                } else if ($(this).siblings().text() == 'Empleado de ventas') {
                    permisos_nomenclatura += 'E.D.V';
                } else if ($(this).siblings().text() == 'Empleado de área') {
                    permisos_nomenclatura += 'E.D.A';
                } else {
                    permisos_nomenclatura += '';
                }
            })
            
            permisos_span.html(permisos_nomenclatura);
        }
    });

    $('#cleanSpan').on('click', function(){
        const permisos_seleccionados = $('input[name="permissions"][type="checkbox"]:not(input[name="permissions"][value="36"], input[name="permissions"][value="37"], input[name="permissions"][value="38"], input[name="permissions"][value="39"]):checked');
        permisos_seleccionados.each(function(){
            $(this).parents().eq(2).children().eq(0).children().eq(0).text('');
        })
    });

    // validate add role form
    validateRolesForm($('#addRoleForm'));

    // ------------------------------- Edit file -------------------------------
    // validate if all permissions are selected
    const num_permisos = $('input[name="permissions"][type="checkbox"]').length;
    const num_permisos_seleccionados = $('input[name="permissions"][type="checkbox"]:checked').length;
    if(num_permisos_seleccionados === (num_permisos - 1)){
        $('#selectAllRoles').prop('checked', true)
    }else{
        $('#selectAllRoles').prop('checked', false)
    }

    // include the nomenclature of all permissions selected
    const permisos_contenedores = $('div.dropdown-menu');
    let permisos_nomenclatura = '';
    let permisos = {};

    permisos_contenedores.each(function(){
        permisos = $(this).children().find('input[name="permissions"][type="checkbox"]:checked');
        permisos.each(function(){
            if ($(this).siblings().text() == 'Ver') {
                permisos_nomenclatura += '<i class="bi bi-eye-fill" style="font-size: 14px;"></i> ';
            } else if ($(this).siblings().text() == 'Agregar') {
                permisos_nomenclatura += '<i class="bi bi-plus-circle" style="font-size: 14px;"></i> ';
            } else if ($(this).siblings().text() == 'Editar') {
                permisos_nomenclatura += '<i class="bi bi-pencil-square" style="font-size: 14px;"></i>';
            } else if ($(this).siblings().text() == 'Empleado de ventas') {
                permisos_nomenclatura += 'E.D.V';
            } else if ($(this).siblings().text() == 'Empleado de área') {
                permisos_nomenclatura += 'E.D.A';
            } else {
                permisos_nomenclatura += '';
            }
        })

        $(this).parents().eq(0).children().eq(0).children().eq(0).html(permisos_nomenclatura);
        permisos_nomenclatura = '';
    })


    // validate edit role form
    validateRolesForm($('#editRoleForm'));
})