(function () {
    'use strict';
    angular
        .module('fight')
        .service('fight.fight', fight);
    fight.$inject = [
        '$rootScope',
        '$sce',
        'fight.settings',
        'main.websockets'
    ];
    function fight(
        $rootScope,
        $sce,
        settings,
        websockets
    ) {
        var
            service;
        service = {
            defense: defense,
            defenses: settings.defenses,
            interface: {
                state: 'watching',
                steps: []
            },
            maneuver: maneuver,
            maneuvers: settings.maneuvers,
            socket: websockets()
        };
        service.socket.on('cornerUpdate', onCornerUpdate);
        service.socket.on('message', onMessage);
        return service;
        //
        // functions
        //
        function defense(configuration) {
            service.socket.send('activeDefense', configuration);
        }
        function flash(cssClass) {
            angular.element(document.querySelector('#main')).addClass(cssClass);
            setTimeout(function () {
                angular.element(document.querySelector('#main')).removeClass(cssClass);
            }, 1000);
        }
        function maneuver(configuration) {
            service.socket.send('maneuver', configuration);
        }
        function onMessage(data) {
            if (data.message) {
                data.message = '<u>"' + data.message + '"</u>';
                data.message = $sce.trustAsHtml(data.message);
                service.interface.steps.unshift(data.message);
            }
        }
        function onCornerUpdate(data) {
            if (
                data.hit
                &&
                data.hit.injury
            ) {
                if (
                    data.hit.corner === service.interface.corner
                ) {
                    flash('greenFlash');
                } else {
                    flash('redFlash');
                }
            }
            if (data.blueCorner) {
                service.interface.blueCorner = data.blueCorner;
            }
            if (data.redCorner) {
                service.interface.redCorner = data.redCorner;
            }
            if (data.state) {
                service.interface.state = data.state;
            }
            if (data.step) {
                // service.interface.lastState = data.step.state;
                data.step = data.step.replace(/ \| /g, '<br>');
                data.step = $sce.trustAsHtml(data.step);
                service.interface.steps.unshift(data.step);
            }
            if (data.tries !== undefined) {
                service.interface.riseTries = data.tries;
                // service.interface.steps.unshift({
                //     successRoll: data.successRoll,
                //     state: data.state,
                //     tries: data.tries,
                //     fighter: data.fighter
                // });
            }
            if (data.winner) {
                service.interface.winner = data.winner;
            }
            if (data.thisCorner) {
                service.interface.corner = data.thisCorner;
                if (
                    data.thisCorner === 'blueCorner'
                ) {
                    service.interface.otherCorner = 'redCorner';
                } else {
                    service.interface.otherCorner = 'blueCorner';
                }
            }
            $rootScope.$apply();
        }
    }
}());
