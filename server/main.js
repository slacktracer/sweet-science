'use strict';
(function (
    express,
    modules
) {
    let application = express();
    let local = !!process.env.LOCAL;
    let port = process.env.PORT;
    if (local) {
        application.use(express.static('../client'));
        port = 3003;
    }
    let server = application.listen(port, onListening);
    let game = new modules.Game(server, local);
    game.start();
    //
    // functions
    //
    function onListening() {
        console.log('"Boxing is the toughest and loneliest sport in the world." -- Frank Bruno');
    }
}(
    require('express'),
    { // modules
        Game: require('./modules/game')
    }
));
