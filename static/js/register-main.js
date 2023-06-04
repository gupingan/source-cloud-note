var registerParams = {
    'api-to-login': null,
};

$(document).ready(function () {
    $toLoginButton = $('#to-login-btn');
    $toLoginButton.on('click', function(){
        window.location.assign(registerParams['api-to-login']);
    });

    var $popup = $('#popup');
    if ($popup.length) {
        $popup.css('z-index', 9999)
            .css('opacity', '1');
        setTimeout(function () {
            $popup.css('opacity', '0');
        }, 1500);
        setTimeout(function () {
            $popup.css('z-index', -1);
        }, 2600);
    }
});
