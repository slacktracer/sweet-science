'use strict';
(function (
    modules
) {
    class Game {
        constructor(server, local) {
            this.audience = new Set();
            this.fight = new modules.Fight();
            this.sockets = modules.websockets(
                server,
                this.onConnection.bind(this),
                this.onDisconnection.bind(this),
                local
            );
        }
        onConnection(socket) {
            this.audience.add(socket);
            this.setEventsOnSocket(socket);
            this.updateAllSockets();
        }
        onDisconnection(socket) {
            this.audience.delete(socket);
            if (
                socket.id === (
                    this.fight.blueCorner
                    &&
                    this.fight.blueCorner.socket.id
                )
                ||
                socket.id === (
                    this.fight.redCorner
                    &&
                    this.fight.redCorner.socket.id
                )
            ) {
                this.fight = new modules.Fight();
                this.start();
            }
            this.updateAllSockets();
        }
        setEventsOnSocket(socket) {
            socket.on('ready', onReady.bind(this, socket));
        }
        start() {
            this.state = 'waiting';
        }
        updateAllSockets() {
            let data = {
                audience: this.audience.size - this.fight.fighterCount,
                fighters: this.fight.fighterCount,
                state: this.state
            };
            this.sockets.send('gameUpdate', data);
        }
    }
    module.exports = Game;
    //
    // functions
    //
    function onReady(socket, sheet) {
        if (this.fight.addFighter(sheet, socket)) {
            this.state = 'fightInProgress';
        }
        this.updateAllSockets();
    }
}(
    {
        Fight: require('./fight'),
        websockets: require('./websockets')
    }
));
