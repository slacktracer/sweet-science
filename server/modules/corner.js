'use strict';
(function () {
    class Corner {
        constructor(name, socket) {
            this.name = name;
            this.socket = socket;
            this.sendUpdate({
                thisCorner: this.name
            });
        }
        handleActiveDefenseConfiguration(activeDefenseConfiguration) {
            let activeDefense = {
                feverish: activeDefenseConfiguration.feverish,
                name: activeDefenseConfiguration.name,
                retreat: activeDefenseConfiguration.retreat
            };
            return activeDefense;
        }
        handleManeuverConfiguration(maneuverConfiguration) {
            let maneuver = {
                corner: this.name,
                name: maneuverConfiguration.name,
                owner: this.fighter.name
            };
            if (maneuverConfiguration.name === 'attack') {
                maneuver.hitLocation = maneuverConfiguration.hitLocation;
                maneuver.mighty = maneuverConfiguration.mighty;
            }
            if (maneuverConfiguration.name === 'allOutAttack') {
                maneuver.hitLocation = maneuverConfiguration.hitLocation;
                maneuver.allOutAttackOption = maneuverConfiguration.allOutAttackOption;
                maneuver.mighty = maneuverConfiguration.mighty;
            }
            return maneuver;
        }
        sendMessage(message) {
            let data = {
                message
            };
            this.socket.send('message', data);
        }
        sendUpdate(data, state) {
            data.state = state;
            this.socket.send('cornerUpdate', data);
        }
    }
    module.exports = Corner;
}());
