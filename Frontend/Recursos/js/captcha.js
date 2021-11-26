/////// generate captcha///////
function generateCaptcha(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

//////// default captcha ///////
$('.dynamic-code').text(generateCaptcha(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));

$('.captcha-reload').on('click', function () {
    $('.dynamic-code').text(generateCaptcha(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
});

/////// check captcha ///////
$('#captcha-input').on('change', function () {
    if($(this).val() != $('.dynamic-code').text()){
        $('#errCaptcha').html('<span style="color: red;"><i class="ion-close"></i> No coincide el código captcha.</span>');
        $(this).val('');
    }else {
        $('#errCaptcha').html('');
    }
});