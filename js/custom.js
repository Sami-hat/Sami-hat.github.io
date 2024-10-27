
$(function () {
    'use strict'

    // MENU
    $('.navbar .nav-link').on('click', function () {
        $(".navbar-collapse").collapse('hide');
    });

    $(window).on('scroll', function () {

        /*----------------------------------------------------*/
        /*  Navigtion Menu Scroll
        /*----------------------------------------------------*/

        var b = $(window).scrollTop();

        if (b > 72) {
            $(".navbar").addClass("scroll");
        } else {
            $(".navbar").removeClass("scroll");
        }
    });


    // SMOOTHSCROLL
    $(function () {
        $('.navbar .nav-link').on('click', function (event) {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top - 49
            }, 1000);
            event.preventDefault();
        });
    });

});
