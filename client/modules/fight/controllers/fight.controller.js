(function () {
    'use strict';
    angular
        .module('fight')
        .controller('Fight', Fight);
    Fight.$inject = [
        'fight.fight'
    ];
    function Fight(
        fight
    ) {
        var
            vm;
        vm = this;
        vm.interface = fight.interface;
    }
}());
