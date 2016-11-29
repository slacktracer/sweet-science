'use strict';
(function () {
    class Fighter {
        constructor(sheet) {
            this.corner = sheet.corner;
            this.dexterity = toNumber(sheet.dexterity);
            this.evaluate = 0;
            this.health = toNumber(sheet.health);
            this.name = sheet.name;
            this.retreats = 4;
            this.shock = 0;
            this.strength = toNumber(sheet.strength);
            this.stunned = false;
            this.currentHitPoints = this.strength;
            this.hitPoints = this.strength;
            this.halfHitPoints = Math.floor(this.hitPoints / 2);
            this.thirdHitPoints = Math.floor(this.hitPoints / 3);
            this.currentFatiguePoints = this.health;
            this.fatiguePoints = this.health;
        }
        get asJSON() {
            return {
                boxing: this.boxing,
                corner: this.corner,
                currentFatiguePoints: this.currentFatiguePoints,
                currentHitPoints: this.currentHitPoints,
                dexterity: this.dexterity,
                dodge: this.dodge,
                evaluate: this.evaluate,
                fatiguePoints: this.fatiguePoints,
                health: this.health,
                hitPoints: this.hitPoints,
                name: this.name,
                parry: this.parry,
                retreats: this.retreats,
                shock: this.shock,
                strength: this.strength,
                stunned: this.stunned
            };
        }
        get basicMove() {
            return (this.currentHitPoints < this.thirdHitPoints) ? Math.ceil(Math.floor(this.basicSpeed) / 2) : Math.floor(this.basicSpeed);
        }
        get basicSpeed() {
            return (this.dexterity + this.health) / 4;
        }
        get boxing() {
            return this.dexterity + 2;
        }
        get deathRollThresholds() {
            return [
                this.hitPoints * -1,
                this.hitPoints * -2,
                this.hitPoints * -3,
                this.hitPoints * -4
            ];
        }
        get dodge() {
            return (this.currentHitPoints < this.thirdHitPoints) ? Math.ceil((this.basicMove + 3) / 2) : this.basicMove + 3;
        }
        get evaluation() {
            let bonus = this.bonus;
            this.bonus = 0;
            return bonus;
        }
        get parry() {
            return Math.floor(this.boxing / 2) + 3;
        }
        get unconsciousnessRollModifier() {
            let modifier = 0;
            if (
                this.currentHitPoints < this.hitPoints * -1
            ) {
                modifier = -1;
                if (
                    this.currentHitPoints < this.hitPoints * -2
                ) {
                    modifier = -2;
                    if (
                        this.currentHitPoints < this.hitPoints * -3
                    ) {
                        modifier = -3;
                        if (
                            this.currentHitPoints < this.hitPoints * -4
                        ) {
                            modifier = -4;
                        }
                    }
                }
            }
            return modifier;
        }
        crossedDeathThreshold(damage) {
            return this.deathRollThresholds.some(function some(threshold) {
                if (
                    this.currentHitPoints > threshold
                    &&
                    this.currentHitPoints - damage <= threshold
                ) {
                    return true;
                }
            }, this);
        }
        getEvaluate() {
            let evaluate = this.evaluate;
            this.evaluate = 0;
            return evaluate;
        }
        getShock() {
            let shock = this.shock;
            this.shock = 0;
            return shock;
        }
        retreat() {
            if (
                this.retreats
            ) {
                this.retreats -= 1;
                return true;
            }
            return false;
        }
        setEvaluate() {
            this.evaluate += 1;
            if (this.evaluate > 3) {
                this.evaluate = 3;
            }
        }
        setShock(damage) {
            this.shock -= damage;
            if (this.shock < -4) {
                this.shock = -4;
            }
        }
        stepForward() {
            this.retreats += 1;
        }
        spendFatigue() {
            if (
                this.currentFatiguePoints > 1
            ) {
                this.currentFatiguePoints -= 1;
                return true;
            }
            return false;
        }
    }
    module.exports = Fighter;
    //
    // functions
    //
    function toNumber(value) {
        let number = +value;
        if (isNaN(number)) {
            throw new Error('Not a number');
        }
        return number;
    }
}());
