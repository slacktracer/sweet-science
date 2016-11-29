(function () {
    'use strict';
    angular
        .module('main')
        .service('main.websockets', websockets);
    websockets.$inject = [
        'main.Primus'
    ];
    function websockets(
        Primus
    ) {
        var
            socket;
        return service;
        //
        // functions
        //
        function service() {
            if (!socket) {
                socket = Primus.connect();
            }
            return socket;
        }
    }
}());
