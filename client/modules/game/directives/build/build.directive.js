(function () {
    'use strict';
    angular
        .module('fight')
        .directive('ssBuild', build);
    function build() {
        return {
            bindToController: true,
            controller: [
                'fight.fight',
                'game.game',
                Controller
            ],
            controllerAs: 'build',
            templateUrl: 'modules/game/directives/build/build.directive.html'
        };
        /**
         * functions
         */
        function Controller(
            fight,
            game
        ) {
            var
                attributeWeights,
                attributes,
                startingPoints,
                vm;
            attributes = [
                'dexterity',
                'health',
                'strength'
            ];
            attributeWeights = {
                dexterity: 10,
                health: 10,
                strength: 10
            };
            startingPoints = 60;
            vm = this;
            vm.boxingLevel = boxingLevel;
            vm.configuration = {
                dexterity: 10,
                health: 10,
                strength: 10
            };
            vm.remainingPoints = remainingPoints;
            vm.send = send;
            //
            // functions
            //
            function attributeCost(attribute) {
                return (+vm.configuration[attribute] - 10) * attributeWeights[attribute];
            }
            function boxingLevel() {
                return +vm.configuration.dexterity + 4;
            }
            function remainingPoints() {
                var
                    points;
                points = startingPoints;
                attributes.forEach(function forEach(attribute) {
                    points -= attributeCost(attribute);
                });
                // return 0;
                return points;
            }
            function send(configuration) {
                vm.done = true;
                game.socket.send('ready', configuration);
            }
        }
    }
}());
