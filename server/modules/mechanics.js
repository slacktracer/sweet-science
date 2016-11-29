'use strict';
(function (
    chance
) {
    let mechanics = {
        damageRoll,
        knockdownModifiersForMajorWounds: {
            face: -5,
            skull: -10,
            torso: 0
        },
        locationModifiers: {
            face: -5,
            skull: -7,
            torso: 0
        },
        setInitiative,
        settings: {
            allOutAttackOptions: {
                determined: 'Determined',
                strong: 'Strong'
            },
            defenses: {
                takeIt: 'Take It',
                dodge: 'Dodge',
                parry: 'Parry'
            },
            hitLocations: {
                face: 'Face',
                skull: 'Skull',
                torso: 'Torso'
            },
            maneuvers: {
                allOutAttack: 'All-Out Attack',
                allOutDefense: 'All-Out Defense',
                attack: 'Attack',
                doNothing: 'Do Nothing',
                evaluate: 'Evaluate'
            }
        },
        successRoll
    };
    module.exports = mechanics;
    //
    // functions
    //
    function basicDamage(strength) {
        let dice;
        if (
            strength > 0
            &&
            strength < 19
        ) {
            dice = 1;
        }
        if (
            strength > 18
            &&
            strength < 27
        ) {
            dice = 2;
        }
        if (
            strength > 26
            &&
            strength < 35
        ) {
            dice = 3;
        }
        if (
            strength > 34
            &&
            strength < 41
        ) {
            dice = 4;
        }
        if (
            strength > 40
            &&
            strength < 55
        ) {
            dice = 5;
        }
        let adds;
        if (
            strength === 1
            ||
            strength === 2
        ) {
            adds = -6;
        }
        if (
            strength === 3
            ||
            strength === 4
        ) {
            adds = -5;
        }
        if (
            strength === 5
            ||
            strength === 6
        ) {
            adds = -4;
        }
        if (
            strength === 7
            ||
            strength === 8
        ) {
            adds = -3;
        }
        if (
            strength === 9
            ||
            strength === 10
        ) {
            adds = -2;
        }
        if (
            strength === 11
            ||
            strength === 12
            ||
            strength === 19
            ||
            strength === 20
            ||
            strength === 35
            ||
            strength === 36
        ) {
            adds = -1;
        }
        if (
            strength === 13
            ||
            strength === 14
            ||
            strength === 21
            ||
            strength === 22
            ||
            strength === 29
            ||
            strength === 30
            ||
            strength === 37
            ||
            strength === 38
            ||
            (
                strength > 40
                &&
                strength < 50
            )
        ) {
            adds = 0;
        }
        if (
            strength === 15
            ||
            strength === 16
            ||
            strength === 23
            ||
            strength === 24
            ||
            strength === 27
            ||
            strength === 28
            ||
            strength === 31
            ||
            strength === 32
            ||
            strength === 39
            ||
            strength === 40
        ) {
            adds = 1;
        }
        if (
            strength === 17
            ||
            strength === 18
            ||
            strength === 25
            ||
            strength === 26
            ||
            strength === 33
            ||
            strength === 34
            ||
            (
                strength > 49
                &&
                strength < 55
            )
        ) {
            adds = 2;
        }
        let basicDamage = {
            adds,
            dice
        };
        return basicDamage;
    }
    function coerce(value) {
        let number = +value;
        if (isNaN(number)) {
            number = 0;
        }
        return number;
    }
    function damageRoll(configuration) {
        let damageConfiguration = basicDamage(configuration.strength);
        let strengthDice = damageConfiguration.dice;
        let strengthAdds = damageConfiguration.adds;
        let diceModifier = strengthAdds + coerce(configuration.diceModifier);
        let dieModifier = coerce(configuration.dieModifier);
        if (
            configuration.strong
        ) {
            if (
                strengthDice > 2
            ) {
                dieModifier += 1;
            } else {
                dieModifier += 2;
            }
        }
        let diceRoll = dice(strengthDice, dieModifier, configuration.maximum);
        let roll = {
            basicDamage: nonnegative(diceRoll.result + diceModifier),
            basicDamageDescription: `${strengthDice}d${dieModifierSign(strengthAdds)}`,
            description: diceRoll.description,
            descriptionWithModifier: diceRoll.descriptionWithModifier
        };
        roll.majorWound = roll.basicDamage > configuration.halfHitPoints;
        return roll;
    }
    function dice(dice, modifier, maximum) {
        let roll = {
            description: '',
            result: 0
        };
        if (
            dice === 0
        ) {
            roll.description = '0';
            return roll;
        }
        if (
            modifier
        ) {
            roll.descriptionWithModifier = '';
        }
        for (let i = 0; i < dice; i += 1) {
            let dieRoll = die(modifier, maximum);
            roll.result += dieRoll.result;
            roll.description += `${dieRoll.description}`;
            if (
                modifier
            ) {
                roll.descriptionWithModifier += `${dieRoll.descriptionWithModifier}`;
            }
            roll.description += ' + ';
            if (
                modifier
            ) {
                roll.descriptionWithModifier += ' + ';
            }
        }
        roll.description = roll.description.slice(0, -3);
        if (
            modifier
        ) {
            roll.descriptionWithModifier = roll.descriptionWithModifier.slice(0, -3);
        }
        if (
            dice > 1
        ) {
            roll.description += ` = ${roll.result}`;
            if (
                modifier
            ) {
                roll.descriptionWithModifier += ` = ${roll.result}`;
            }
        }
        return roll;
    }
    function die(modifier, maximum) {
        let roll = {};
        if (
            !maximum
        ) {
            roll.result = chance.d6();
        }
        if (
            maximum
        ) {
            roll.result = 6;
        }
        if (
            modifier
        ) {
            roll.descriptionWithModifier = `${roll.result}${dieModifierSign(modifier)}`;
            roll.result += modifier;
            roll.result = nonnegative(roll.result);
        }
        roll.description = `${roll.result}`
        return roll;
    }
    function dieModifierSign(modifier) {
        if (
            modifier > 0
        ) {
            return `+${modifier}`;
        }
        if (
            modifier < 0
        ) {
            return `${modifier}`;
        }
        return '';
    }
    function nonnegative(value) {
        if (
            value < 0
        ) {
            value = 0;
        }
        return value;
    }
    function margin(x, y) {
        if (
            x === y
        ) {
            return 0;
        }
        return (x > y) ? x - y : y - x;
    }
    function setInitiative(blueCorner, redCorner) {
        if (blueCorner.fighter.basicSpeed > redCorner.fighter.basicSpeed) {
            return [blueCorner, redCorner];
        }
        if (blueCorner.fighter.basicSpeed < redCorner.fighter.basicSpeed) {
            return [redCorner, blueCorner];
        }
        if (blueCorner.fighter.basicSpeed === redCorner.fighter.basicSpeed) {
            if (blueCorner.fighter.dexterity > redCorner.fighter.dexterity) {
                return [blueCorner, redCorner];
            }
            if (blueCorner.fighter.dexterity < redCorner.fighter.dexterity) {
                return [redCorner, blueCorner];
            }
            if (blueCorner.fighter.dexterity === redCorner.fighter.dexterity) {
                return chance.shuffle([blueCorner, redCorner]);
            }
        }
    }
    function successRoll(target, modifier) {
        if (
            modifier === undefined
        ) {
            modifier = 0;
        }
        let successRollDice = [];
        successRollDice.push(die().result);
        successRollDice.push(die().result);
        successRollDice.push(die().result);
        let roll = {
            modifiedTarget: target + modifier,
            result: successRollDice[0] + successRollDice[1] + successRollDice[2],
            target
        };
        roll.description = `${successRollDice[0]} + ${successRollDice[1]} + ${successRollDice[2]} = ${roll.result}`;
        roll.margin = margin(roll.result, roll.modifiedTarget);
        if (
            roll.result === 3
            ||
            roll.result === 4
        ) {
            roll.critical = true;
            roll.status = true;
            return roll;
        }
        if (
            (
                roll.result === 17
                &&
                roll.modifiedTarget < 16
            )
            ||
            roll.result === 18
        ) {
            roll.critical = true;
            roll.status = false;
            return roll;
        }
        if (
            (
                roll.result === 5
                ||
                roll.result === 6
            )
            &&
            roll.margin >= 10
        ) {
            roll.critical = true;
            roll.status = true;
            return roll;
        }
        if (
            roll.margin >= 10
        ) {
            roll.critical = true;
        }
        roll.critical = false;
        roll.status = roll.result <= roll.modifiedTarget;
        return roll;
    }
}(
    require('chance').Chance()
));
