import { q } from 'module.js';
'use strict';
let name = 'Superman';
let power = 'heat vision';
let crazySymbol = Symbol('quux');
let object = {
    [name]: 'Clark',
    [power + ' level']: 52,
    get foo() {
        return 42;
    },
    [crazySymbol]: 9,
    set bar(value) {
        object[crazySymbol] = 3;
        return true;
    },
    get woo() {
        return object[crazySymbol];
    }
};
console.log(object.foo);
console.log(object.Superman);
console.log(object['heat vision level']);
console.log(object[power + ' level']);
console.log(object[name]);
console.log(object.bar = false);
console.log(object.bar);
console.log(object.woo);
let x;
console.log(x = 10);
console.log(JSON.stringify(object));
console.log(Symbol.for('quux'));
let y = Symbol.for('quux');
console.log(object[Symbol.for('quux')]);
object[y] = 'crazy';
console.log(object[Symbol.for('quux')]);

console.log(q);