(function () {
    'use strict';
    angular
        .module('fight')
        .service('fight.settings', settings);
    function settings() {
        var
            service;
        service = {
            defenses: {
                defaultOption: 'takeIt',
                options: {
                    takeIt: {
                        name: 'Take It',
                        value: 'takeIt'
                    },
                    dodge: {
                        name: 'Dodge',
                        value: 'dodge'
                    },
                    parry: {
                        name: 'Parry',
                        value: 'parry'
                    }
                }
            },
            maneuvers: {
                defaultOption: 'doNothing',
                hitLocation: {
                    defaultOption: 'torso',
                    options: {
                        face: {
                            name: 'Face',
                            value: 'face'
                        },
                        skull: {
                            name: 'Skull',
                            value: 'skull'
                        },
                        torso: {
                            name: 'Torso',
                            value: 'torso'
                        }
                    }
                },
                options: {
                    allOutAttack: {
                        defaultOption: 'determined',
                        name: 'All-Out Attack',
                        options: {
                            determined: {
                                name: 'Determined',
                                value: 'determined'
                            },
                            strong: {
                                name: 'Strong',
                                value: 'strong'
                            }
                        },
                        value: 'allOutAttack'
                    },
                    allOutDefense: {
                        name: 'All-Out Defense',
                        value: 'allOutDefense'
                    },
                    attack: {
                        name: 'Attack',
                        value: 'attack'
                    },
                    doNothing: {
                        name: 'Do Nothing',
                        value: 'doNothing'
                    },
                    evaluate: {
                        name: 'Evaluate',
                        value: 'evaluate'
                    }
                }
            }
        };
        return service;
    }
}());
