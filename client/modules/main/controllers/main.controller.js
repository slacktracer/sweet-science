(function () {
    'use strict';
    angular
        .module('main')
        .controller('Main', Main);
    function Main() {
        var
            vm;
        vm = this;
        vm.currentView = 'modules/game/templates/game.template.html';
    }
}());
