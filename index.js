$(document).ready(function(){
    console.log('Ready!');

    $('#topics').on('click', '.badge', function(){
        $('#topics .badge').removeClass('badge-active');
        $(this).addClass('badge-active');
    });
});