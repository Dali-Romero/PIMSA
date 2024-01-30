$(document).ready(function(){
    // ------------------------------- list file -------------------------------
    // list quotations table
    $.fn.dataTable.moment('DD/MM/YYYY, HH:mm');
    new DataTable('#orders-table', {
        paging: false,
        info: false,
        padding: false,
        order: [[1, 'Desc'], [0, 'Desc']],
        dom: '<"float-start pb-2"f>', 
        columnDefs: [
            {className: "dt-center", targets: "_all"},
        ],
        language:{
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-MX.json',
        },
    });
});