(function () {
    'use strict';
    angular
        .module('game')
        .controller('Game', Game);
    Game.$inject = [
        'game.game'
    ];
    function Game(
        game
    ) {
        var
            vm;
        vm = this;
        vm.interface = game.interface;
    }
}());
