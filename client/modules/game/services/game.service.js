(function () {
    'use strict';
    angular
        .module('game')
        .service('game.game', game);
    game.$inject = [
        '$rootScope',
        'main.websockets'
    ];
    function game(
        $rootScope,
        websockets
    ) {
        var
            service;
        service = {
            interface: {
                audience: 0,
                fighters: 0,
                state: ''
            },
            socket: websockets()
        };
        service.socket.on('gameUpdate', onUpdate);
        return service;
        //
        // functions
        //
        function onUpdate(data) {
            service.interface.audience = data.audience;
            service.interface.fighters = data.fighters;
            service.interface.state = data.state;
            $rootScope.$apply();
        }
    }
}());
