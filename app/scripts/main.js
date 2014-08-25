jQuery(document).ready(function($) {
    var game = new Game();
    $('.play a').on('click', function(event) {
        event.preventDefault();
        $('.how_to_play').hide('200');
        $('header').hide('500', function() {
            game.play();
        });
        $('.game_asset').show('500');
    });
    // $('.how_to_play a').on('click', function(event) {
    //     event.preventDefault();
    //     $('.how_to_play').hide('200');
    //     $('header').hide('500', function() {
    //         game.tutorial();
    //     });
    //     $('.game_asset').show('500');
    // });
    $('#infobtn').on('click', function(event) {
        event.preventDefault();
        $('.how_to_play').show('200');
        $('header').show('500');
        $('.game_asset').hide('500');
    });
    $('#refresh').on('click', function(event) {
        event.preventDefault();
        game.restart();
    });
    $('#next').on('click', function(event) {
        event.preventDefault();
        game.nextLevel();
    });
    $('#previous').on('click', function(event) {
        event.preventDefault();
        game.previousLevel();
    });
    $('#sharebtn').on('click', function(event) {
        event.preventDefault();
        if (game.isopenSocial()) {
            game.closeSocial();
        } else {
            game.openSocial();
        }
    });
    $(window).unload(function() {
        game.saveState();
    });
});