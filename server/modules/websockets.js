'use strict';
(function (
    path,
    Emitter,
    Primus
) {
    module.exports = websockets;
    //
    // functions
    //
    function websockets(server, onConnection, onDisconnection, local) {
        let sockets = new Primus(server);
        sockets.use('emitter', Emitter);
        sockets.on('connection', onConnection);
        sockets.on('disconnection', onDisconnection);
        let savePath;
        if (local) {
            savePath = path.join(__dirname, '/../../client/3rd-party/assets/primus/primus.js');
        } else {
            savePath = path.join(__dirname, '../public/3rd-party/assets/primus/primus.js');
        }
        sockets.save(savePath);
        return sockets;
    }
}(
    require('path'),
    require('primus-emitter'),
    require('primus')
));
