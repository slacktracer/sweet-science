'use strict';
(function (
    modules
) {
    let rules = {
        processActiveDefense,
        processDamage,
        processManeuver
    };
    module.exports = rules;
    //
    // functions
    //
    function processActiveDefense(maneuver, fighter, otherFighter) {
        if (
            maneuver.target.activeDefense.name === 'takeIt'
        ) {
            maneuver.state = 'tookIt';
            processHit(maneuver, fighter, otherFighter);
            return;
        }
        let modifier = 0;
        if (
            maneuver.target.activeDefense.retreat === true
        ) {
            maneuver.target.activeDefense.retreating = otherFighter.retreat();
            if (
                maneuver.target.activeDefense.retreating === true
            ) {
                fighter.stepForward();
                modifier += 3;
            }
        }
        if (
            maneuver.target.activeDefense.feverish
        ) {
            maneuver.target.activeDefense.feverishly = otherFighter.spendFatigue();
            if (
                maneuver.target.activeDefense.feverishly === true
            ) {
                modifier += 2;
            }
        }
        maneuver.target.activeDefense.successRoll = modules.mechanics.successRoll(otherFighter[maneuver.target.activeDefense.name], modifier);
        if (
            maneuver.target.activeDefense.successRoll.status === true
        ) {
            maneuver.state = 'successfulActiveDefense';
            if (
                maneuver.target.activeDefense.successRoll.critical === true
            ) {
                maneuver.state = 'criticallySuccessfulActiveDefense';
            }
        }
        if (
            maneuver.target.activeDefense.successRoll.status === false
        ) {
            maneuver.state = 'failedActiveDefense';
            if (
                maneuver.target.activeDefense.successRoll.critical === true
            ) {
                maneuver.state = 'criticallyFailedActiveDefense';
            }
            processHit(maneuver, fighter, otherFighter);
        }
    }
    function processDamage(maneuver, fighter, otherFighterName) {
        if (
            maneuver.damageRoll.basicDamage < 1
        ) {
            return;
        }
        if (
            maneuver.hitLocation === 'skull'
        ) {
            maneuver.damageRoll.penetratingDamage = maneuver.damageRoll.basicDamage - 2;
            if (
                maneuver.damageRoll.penetratingDamage < 1
            ) {
                maneuver.damageRoll.penetratingDamage = 1;
            }
            maneuver.damageRoll.finalDamage = maneuver.damageRoll.penetratingDamage * 4;
            maneuver.target.injury = maneuver.damageRoll.finalDamage;
        } else {
            maneuver.target.injury = maneuver.damageRoll.basicDamage;
        }
        fighter.setShock(maneuver.target.injury);
        if (
            fighter.crossedDeathThreshold(maneuver.target.injury)
        ) {
            maneuver.target.death = {
                successRoll: modules.mechanics.successRoll(fighter.health)
            };
            if (
                maneuver.target.death.successRoll.status === false
            ) {
                fighter.currentHitPoints -= maneuver.target.injury;
                maneuver.damageState = 'death';
                maneuver.final = true;
                maneuver.winner = otherFighterName;
                return;
            }
        }
        fighter.currentHitPoints -= maneuver.target.injury;
        if (
            maneuver.damageRoll.majorWound
            ||
            maneuver.hitLocation === 'face'
            ||
            maneuver.hitLocation === 'skull'
        ) {
            let modifier = 0;
            if (
                maneuver.damageRoll.majorWound
            ) {
                modifier = modules.mechanics.knockdownModifiersForMajorWounds[maneuver.hitLocation];
            }
            maneuver.target.knockdown = {
                successRoll: modules.mechanics.successRoll(fighter.health, modifier)
            };
            if (
                maneuver.target.knockdown.successRoll.status === false
            ) {
                maneuver.damageState = 'knockdown';
                fighter.stunned = true;
                if (
                    maneuver.target.knockdown.successRoll.critical === true
                    ||
                    maneuver.target.knockdown.successRoll.margin > 5
                ) {
                    maneuver.target.knockout = true;
                    maneuver.damageState = 'knockout';
                    maneuver.final = true;
                    maneuver.winner = otherFighterName;
                }
            }
        }
        if (
            (fighter.hitPoints * -5) >= fighter.currentHitPoints
        ) {
            maneuver.damageState = 'death';
            maneuver.final = true;
            maneuver.winner = otherFighterName;
        }
    }
    function processHit(maneuver, fighter, otherFighter) {
        let is_strong = false;
        if (
            (
                maneuver.name === 'allOutAttack'
                &&
                maneuver.allOutAttackOption === 'strong'
            )
            ||
            maneuver.mighty
        ) {
            is_strong = true;
        }
        maneuver.damageRoll = modules.mechanics.damageRoll({
            halfHitPoints: otherFighter.halfHitPoints,
            maximum: maneuver.successRoll.result === 3,
            strength: fighter.strength,
            strong: is_strong
        });
        processDamage(maneuver, otherFighter, fighter.name);
    }
    function processManeuver(maneuver, fighter, otherFighter) {
        if (
            maneuver.mighty
        ) {
            fighter.spendFatigue();
        }
        let shock = fighter.getShock();
        if (
            maneuver.name !== 'doNothing'
            &&
            fighter.currentHitPoints < 1
        ) {
            maneuver.unconsciousness = {
                successRoll: modules.mechanics.successRoll(fighter.health, fighter.unconsciousnessRollModifier)
            };
            if (
                maneuver.unconsciousness.successRoll.status === false
            ) {
                maneuver.state = 'unconsciousness';
                maneuver.final = true;
                maneuver.winner = otherFighter.name;
                return;
            }
        }
        if (
            maneuver.name === 'doNothing'
            ||
            maneuver.name === 'allOutDefense' // "placeholder"
        ) {
            maneuver.state = 'didNothing';
            return;
        }
        if (
            maneuver.name === 'attack'
            ||
            maneuver.name === 'allOutAttack'
        ) {
            maneuver.target = {
                corner: otherFighter.corner,
                name: otherFighter.name
            };
            let modifier = 0;
            modifier += modules.mechanics.locationModifiers[maneuver.hitLocation];
            modifier += fighter.getEvaluate();
            modifier += shock;
            if (
                maneuver.name === 'allOutAttack'
                &&
                maneuver.allOutAttackOption === 'determined'
            ) {
                modifier += 4;
            }
            maneuver.successRoll = modules.mechanics.successRoll(fighter.boxing, modifier);
            if (
                maneuver.successRoll.status === true
            ) {
                maneuver.state = 'successfulManeuver';
                if (
                    maneuver.successRoll.critical === true
                ) {
                    maneuver.state = 'criticallySuccessfulManeuver';
                    processHit(maneuver, fighter, otherFighter);
                } else {
                    if (
                        maneuver.previously === 'allOutAttack'
                        &&
                        maneuver.owner !== fighter.name
                    ) {
                        maneuver.state = 'noDefense';
                        processHit(maneuver, fighter, otherFighter);
                    }
                }
            }
            if (
                maneuver.successRoll.status === false
            ) {
                if (
                    (
                        maneuver.hitLocation === 'face'
                        ||
                        maneuver.hitLocation === 'skull'
                    )
                    &&
                    maneuver.successRoll.margin === 1
                    &&
                    !maneuver.successRoll.critical
                ) {
                    maneuver.originalHitLocation = maneuver.hitLocation;
                    maneuver.hitLocation = 'torso';
                    maneuver.state = 'missedByOne';
                    if (
                        maneuver.previously === 'allOutAttack'
                    ) {
                        maneuver.state = 'missedByOne&&noDefense';
                        processHit(maneuver, fighter, otherFighter);
                    }
                } else {
                    maneuver.state = 'failedManeuver';
                    if (
                        maneuver.successRoll.critical === true
                    ) {
                        maneuver.state = 'criticallyFailedManeuver';
                    }
                }
            }
            return;
        }
        if (
            maneuver.name === 'evaluate'
        ) {
            maneuver.state = 'evaluated';
            fighter.setEvaluate();
            return;
        }
    }
}(
    { // modules
        mechanics: require('./mechanics')
    }
));
