'use strict';
(function (
    fs,
    modules,
    path
) {
    class Fight {
        constructor() {
            this.blueCorner = false; // then Fighter
            this.id = null; // then number
            this.maneuvers = [];
            this.redCorner = false; // then Fighter
            this.state = false; // then string
            this.turns = false; // then array
        }
        get corner() {
            return this.turns[0];
        }
        get corners() {
            let corners = {};
            corners[this.corner.name] = this.corner.fighter.asJSON;
            corners[this.otherCorner.name] = this.otherCorner.fighter.asJSON;
            return corners;
        }
        get fighterCount() {
            let count = 0;
            if (this.blueCorner) {
                count += 1;
            }
            if (this.redCorner) {
                count += 1;
            }
            return count;
        }
        get lastManeuver() {
            let lastPosition = this.maneuvers.length - 1;
            if (this.maneuvers[lastPosition]) {
                return this.maneuvers[lastPosition];
            }
            return {};
        }
        get otherCorner() {
            return this.turns[1];
        }
        addFighter(sheet, socket) {
            if (this.blueCorner === false) {
                let corner = 'blueCorner';
                sheet.corner = corner;
                sheet.name = 'I. Leite';
                this.blueCorner = new modules.Corner(corner, socket);
                this.blueCorner.fighter = new modules.Fighter(sheet);
                return false;
            }
            if (this.redCorner === false) {
                let corner = 'redCorner';
                sheet.corner = corner;
                sheet.name = 'J. Lima';
                this.redCorner = new modules.Corner(corner, socket);
                this.redCorner.fighter = new modules.Fighter(sheet);
                this.start();
                this.id = Date.now();
                return true;
            }
        }
        advance(data, cornerState, otherCornerState) {
            this.corner.sendUpdate(data, cornerState);
            this.otherCorner.sendUpdate(data, otherCornerState);
        }
        end(data, cornerState, otherCornerState) {
            this.advance(data, cornerState, otherCornerState);
        }
        notify(message) {
            this.corner.sendMessage(message);
            this.otherCorner.sendMessage(message);
        }
        setEventsOnSocket(socket) {
            socket.on('activeDefense', onActiveDefense.bind(this, socket));
            socket.on('maneuver', onManeuver.bind(this, socket));
        }
        start() {
            this.turns = modules.mechanics.setInitiative(this.blueCorner, this.redCorner);
            this.setEventsOnSocket(this.blueCorner.socket);
            this.setEventsOnSocket(this.redCorner.socket);
            let data = this.corners;
            this.advance(data, 'maneuver', 'waitingManeuver');
        }
        switchTurns() {
            this.turns.reverse();
        }
    }
    module.exports = Fight;
    //
    // functions
    //
    function onActiveDefense(socket, configuration) {
        if (socket !== this.otherCorner.socket) {
            return;
        }
        let maneuver = this.lastManeuver;
        maneuver.target.activeDefense = this.otherCorner.handleActiveDefenseConfiguration(configuration);
        modules.rules.processActiveDefense(maneuver, this.corner.fighter, this.otherCorner.fighter);
        postProcessing.call(this, maneuver);
    }
    function onManeuver(socket, configuration) {
        if (socket !== this.corner.socket) {
            return;
        }
        let maneuver = this.corner.handleManeuverConfiguration(configuration);
        maneuver.previously = this.lastManeuver.name;
        this.maneuvers.push(maneuver);
        modules.rules.processManeuver(maneuver, this.corner.fighter, this.otherCorner.fighter);
        postProcessing.call(this, maneuver);
    }
    function specialCircumstances(fight, maneuver) {
        if (
            maneuver.target
            &&
            maneuver.target.activeDefense
            &&
            maneuver.target.activeDefense.retreat
            &&
            maneuver.target.activeDefense.retreating === false
        ) {
            fight.notify(`You can't retreat, ${fight.otherCorner.fighter.name}. MAN UP!`);
        }
        if (
            maneuver.target
            &&
            maneuver.target.knockdown
            &&
            maneuver.target.knockdown.successRoll.status
            &&
            maneuver.target.knockdown.successRoll.margin < 3
        ) {
            fight.notify(`Wake up, ${fight.otherCorner.fighter.name}. WAKE UP!`);
        }
    }
    function postProcessing(maneuver) {
        specialCircumstances(this, maneuver);
        let data = this.corners;
        maneuver.step = makeStep(maneuver);
        data.step = maneuver.step;
        data.winner = maneuver.winner;
        data.hit = hit(maneuver);
        if (
            (
                maneuver.state === 'criticallyFailedActiveDefense'
                ||
                maneuver.state === 'criticallyFailedManeuver'
                ||
                maneuver.state === 'criticallySuccessfulActiveDefense'
                ||
                maneuver.state === 'criticallySuccessfulManeuver'
                ||
                maneuver.state === 'didNothing'
                ||
                maneuver.state === 'evaluated'
                ||
                maneuver.state === 'failedActiveDefense'
                ||
                maneuver.state === 'failedManeuver'
                ||
                maneuver.state === 'noDefense'
                ||
                maneuver.state === 'missedByOne&&noDefense'
                ||
                maneuver.state === 'successfulActiveDefense'
                ||
                maneuver.state === 'tookIt'
            )
            &&
            !maneuver.final
        ) {
            if (
                maneuver.damageState === 'knockdown'
            ) {
                tree(maneuver, this.id);
                this.advance(data, 'waitingRise', 'tryingToRise');
                let tries = 0;
                let newData = {
                    fighter: this.otherCorner.fighter.name,
                    state: 'tryingToRise',
                    tries
                };
                newData.step = makeStep(newData);
                tree(newData, this.id);
                this.advance(newData, 'waitingRise', 'tryingToRise');
                tryToRise(this);
                function tryToRise(fight) {
                    setTimeout(
                        function onTimeout(fight) {
                            tries += 1;
                            let rise;
                            let successRoll = modules.mechanics.successRoll(fight.otherCorner.fighter.health);
                            if (
                                successRoll.status
                            ) {
                                rise = true;
                            } else {
                                rise = false;
                            }
                            if (!rise) {
                                let data = {
                                    tries,
                                    state: 'tryingToRise',
                                    successRoll,
                                    fighter: fight.otherCorner.fighter.name
                                };
                                data.step = makeStep(data);
                                tree(data, fight.id);
                                fight.advance(data, 'waitingRise', 'tryingToRise');
                                tryToRise(fight);
                                return;
                            }
                            newData = {
                                tries,
                                state: 'tryingToRise',
                                successRoll,
                                fighter: fight.otherCorner.fighter.name
                            };
                            newData.step = makeStep(newData);
                            tree(newData, fight.id);
                            fight.advance(newData, 'waitingRise', 'tryingToRise');
                            fight.otherCorner.fighter.stunned = false;
                            fight.turns = modules.mechanics.setInitiative(fight.blueCorner, fight.redCorner);
                            fight.advance(fight.corners, 'maneuver', 'waitingManeuver');
                        },
                        3000,
                        fight
                    );
                }
                return;
            }
            this.advance(data, 'waitingManeuver', 'maneuver');
            this.switchTurns();
        }
        if (
            (
                maneuver.state === 'successfulManeuver'
                ||
                maneuver.state === 'missedByOne'
            )
            &&
            !maneuver.final
        ) {
            this.advance(data, 'waitingActiveDefense', 'activeDefense');
        }
        if (maneuver.final) {
            // data.finalStep = maneuver.finalStep;
            this.end(data, 'theEnd', 'theEnd');
        }
        tree(maneuver, this.id);
    }
    function hit(maneuver) {
        let hitObject = {
            corner: maneuver.corner,
            injury: false
        };
        if (
            maneuver.target
            &&
            maneuver.target.injury
        ) {
            hitObject.injury = true;
        }
        return hitObject;
    }
    function makeStep(maneuver) {
        let step = '';
        if (
            maneuver.state === 'didNothing'
        ) {
            step += `${maneuver.owner} did nothing`;
        }
        if (
            maneuver.state === 'evaluated'
        ) {
            step += `${maneuver.owner} evaluated`
        }
        if (
            maneuver.state === 'tookIt'
        ) {
            step += `${maneuver.target.name} took it${damageRoll(maneuver.damageRoll)}`
        }
        if (
            maneuver.state === 'unconsciousness'
        ) {
            step += `${maneuver.owner} fell unconscious${maneuver.unconsciousness.successRoll ? ' => Success Roll: ' + maneuver.unconsciousness.successRoll.description + ' :: ' + maneuver.unconsciousness.successRoll.modifiedTarget : ''}`
        }
        if (
            maneuver.state === 'tryingToRise'
        ) {
            step += `${maneuver.fighter} is trying to rise ${maneuver.tries ? ': ' + maneuver.tries : ''}${maneuver.successRoll ? ' => Success Roll: ' + maneuver.successRoll.description + ' :: ' + maneuver.successRoll.modifiedTarget : ''}`;
        }
        if (
            maneuver.state === 'criticallySuccessfulManeuver'
            ||
            maneuver.state === 'noDefense'
            ||
            maneuver.state === 'missedByOne&&noDefense'
        ) {
            step += `${maneuver.owner} -> ${maneuver.target.name}: ${maneuver.successRoll.critical ? 'CRITICAL ' : ''}${maneuver.successRoll.status ? 'SUCCESS' : 'FAILURE'}, ${maneuver.name}${maneuver.allOutAttackOption ? ', ' + maneuver.allOutAttackOption : ''}, ${maneuver.hitLocation} ${originalHitLocation(maneuver.originalHitLocation)} => Success Roll: ${maneuver.successRoll.description} :: ${maneuver.successRoll.modifiedTarget}${damageRoll(maneuver.damageRoll)}`;
        }
        if (
            maneuver.state === 'successfulManeuver'
            ||
            maneuver.state === 'missedByOne'
            ||
            maneuver.state === 'criticallyFailedManeuver'
            ||
            maneuver.state === 'failedManeuver'
        ) {
            step += `${maneuver.owner} -> ${maneuver.target.name}:  ${maneuver.successRoll.critical ? 'CRITICAL ' : ''}${maneuver.successRoll.status ? 'SUCCESS' : 'FAILURE'}, ${maneuver.name}${maneuver.allOutAttackOption ? ', ' + maneuver.allOutAttackOption : ''}, ${maneuver.hitLocation} ${originalHitLocation(maneuver.originalHitLocation)} => Success Roll: ${maneuver.successRoll.description} :: ${maneuver.successRoll.modifiedTarget}`;
        }
        if (
            maneuver.unconsciouness
            &&
            maneuver.unconsciouness.sucessRoll === true
        ) {
            step += ` | Unconsciouness Test => ${maneuver.unconsciousness.successRoll.description} :: ${maneuver.unconsciousness.successRoll.modifiedTarget}`
        }
        if (
            maneuver.state === 'criticallySuccessfulActiveDefense'
            ||
            maneuver.state === 'successfulActiveDefense'
        ) {
            step += `${maneuver.target.name} -| ${maneuver.owner}:  ${maneuver.target.activeDefense.successRoll.critical ? 'CRITICAL ' : ''}${maneuver.target.activeDefense.successRoll.status ? 'SUCCESS' : 'FAILURE'}, ${maneuver.target.activeDefense.name}${maneuver.target.activeDefense.retreating ? ' (retreating)' : ''} => Success Roll: ${maneuver.target.activeDefense.successRoll.description} :: ${maneuver.target.activeDefense.successRoll.modifiedTarget}`;
        }
        if (
            maneuver.state === 'criticallyFailedActiveDefense'
            ||
            maneuver.state === 'failedActiveDefense'
        ) {
            step += `${maneuver.target.name} -| ${maneuver.owner}:  ${maneuver.target.activeDefense.successRoll.critical ? 'CRITICAL ' : ''}${maneuver.target.activeDefense.successRoll.status ? 'SUCCESS' : 'FAILURE'}, ${maneuver.target.activeDefense.name}${maneuver.target.activeDefense.retreating ? ' (retreating)' : ''} => Success Roll: ${maneuver.target.activeDefense.successRoll.description} :: ${maneuver.target.activeDefense.successRoll.modifiedTarget}${damageRoll(maneuver.damageRoll)}`;
        }
        if (
            maneuver.target
            &&
            maneuver.target.knockdown
        ) {
            let state;
            if (maneuver.target.knockdown.successRoll.status) {
                state = `Knockdown Test`
            } else {
                state = `${maneuver.damageState.toUpperCase()}!`;
            }
            step += ` | ${state} => ${maneuver.target.knockdown.successRoll.description} :: ${maneuver.target.knockdown.successRoll.modifiedTarget}`;
        }
        if (
            maneuver.target
            &&
            maneuver.target.death
        ) {
            let state;
            if (maneuver.target.death.successRoll.status) {
                state = `Death Test`
            } else {
                state = `${maneuver.target.name.toUpperCase()} IS DEAD!`;
            }
            step += ` | ${state} => ${maneuver.target.death.successRoll.description} :: ${maneuver.target.death.successRoll.modifiedTarget}`;
        }
        if (
            maneuver.winner
        ) {
            step += ` | ${maneuver.winner} wins!`;
        }
        return step;
        //
        // functions
        //
        function damageRoll(mdr) {
            if (
                mdr
            ) {
                let damage = mdr.penetratingDamage ? mdr.penetratingDamage : mdr.basicDamage
                if (
                    mdr.finalDamage
                ) {
                    damage = mdr.finalDamage
                }
                return ` | DamageRoll: ${damage}${mdr.majorWound ? ' (MAJOR WOUND)' : ''}`;
            }
        }
        function originalHitLocation(ohl) {
            if (
                ohl
            ) {
                return `(${ohl})`;
            }
            return '';
        }
    }
    let lastId = null;
    let local = !!process.env.LOCAL;
    let logsPath
    if (local) {
        logsPath = path.join(__dirname, `/../../client/logs/fights.txt`);
    } else {
        logsPath = path.join(__dirname, `../public/logs/fights.txt`);
    }
    function tree(maneuver, fightId) {
        let stringifiedManeuver = JSON.stringify(maneuver, null, 4);
        let log =
`${stringifiedManeuver}
===
${maneuver.step}
===

`;
        console.log(log);
        let local = !!process.env.LOCAL;
        let logPath;
        if (local) {
            logPath = path.join(__dirname, `/../../client/logs/${fightId}.txt`);
        } else {
            logPath = path.join(__dirname, `../public/logs/${fightId}.txt`);
        }
        fightId = String(fightId);
        fs.appendFile(logPath, log);
        if (
            fightId !== lastId
        ) {
            lastId = fightId;
            let logs =
`logs/${fightId}.txt
`
            fs.appendFile(logsPath, logs);
        }
    }
}(
    require('fs'),
    { // modules
        Corner: require('./corner'),
        Fighter: require('./fighter'),
        mechanics: require('./mechanics'),
        rules: require('./rules')
    },
    require('path')
));
