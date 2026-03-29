
$(function () {
    'use strict'

    // MENU
    $('.navbar .nav-link').on('click', function () {
        $(".navbar-collapse").collapse('hide');
    });

    $(window).on('scroll', function () {
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

    // PROJECT CAROUSEL
    var carousel = $('.project-carousel');

    carousel.owlCarousel({
        items: 1,
        loop: true,
        nav: true,
        navText: [
            '<i class="fas fa-chevron-left"></i>',
            '<i class="fas fa-chevron-right"></i>'
        ],
        dots: true,
        autoplay: false,
        smartSpeed: 600,
        mouseDrag: true,
        touchDrag: true
    });

    // Slide counter
    carousel.on('changed.owl.carousel', function (event) {
        if (!event || !event.item) return;
        var current = event.item.index - event.relatedTarget._clones.length / 2 + 1;
        var total = event.item.count;
        if (current > total) current = current - total;
        if (current < 1) current = total + current;
        $('.slide-counter').text(current + ' / ' + total);
    });

    // Set initial counter
    var totalSlides = carousel.find('.owl-item:not(.cloned)').length;
    if (totalSlides > 0) {
        $('.slide-counter').text('1 / ' + totalSlides);
    }

    // SKILLS ACCORDION - chevron rotation and exclusive behavior
    // Bootstrap handles collapse toggle via data-toggle/data-target
    // We just handle chevron rotation and closing other sections

    $('.collapse').on('show.bs.collapse', function () {
        // Close other open sections
        $('.collapse.show').not(this).collapse('hide');

        // Rotate chevron on the opening section
        $(this).prev('.skill-category').find('.skill-chevron').addClass('rotated');
        $(this).prev('.skill-category').addClass('active');
    });

    $('.collapse').on('hide.bs.collapse', function () {
        $(this).prev('.skill-category').find('.skill-chevron').removeClass('rotated');
        $(this).prev('.skill-category').removeClass('active');
    });

});
