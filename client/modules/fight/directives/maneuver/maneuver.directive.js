(function () {
    'use strict';
    angular
        .module('fight')
        .directive('ssManeuver', maneuver);
    function maneuver() {
        return {
            bindToController: true,
            controller: [
                'fight.fight',
                Controller
            ],
            controllerAs: 'maneuver',
            templateUrl: 'modules/fight/directives/maneuver/maneuver.directive.html'
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
                allOutAttackOption: fight.maneuvers.options.allOutAttack.defaultOption,
                hitLocation: fight.maneuvers.hitLocation.defaultOption,
                name: fight.maneuvers.defaultOption
            };
            vm.hitLocation = {
                options: fight.maneuvers.hitLocation.options
            };
            vm.options = fight.maneuvers.options;
            vm.send = send;
            //
            // functions
            //
            function send(configuration) {
                fight.maneuver(configuration);
            }
        }
    }
}());
