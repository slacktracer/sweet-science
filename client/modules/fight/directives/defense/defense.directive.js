(function () {
    'use strict';
    angular
        .module('fight')
        .directive('ssDefense', defense);
    function defense() {
        return {
            bindToController: true,
            controller: [
                'fight.fight',
                Controller
            ],
            controllerAs: 'defense',
            templateUrl: 'modules/fight/directives/defense/defense.directive.html'
        };
        /**
         * functions
         */
        function Controller(
            fight
        ) {
            var
                vm;
            vm = this;
            vm.configuration = {
                name: fight.defenses.defaultOption
            };
            vm.options = fight.defenses.options;
            vm.send = send;
            //
            // functions
            //
            function send(configuration) {
                fight.defense(configuration);
            }
        }
    }
}());
