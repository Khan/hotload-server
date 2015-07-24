'use strict';

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var debounce = require('debounce');
var chokidar = require('chokidar'); // file watching

var argv = require('yargs').usage('Usage: $0 --port <port> <globs-to-watch> [ ... ]').example('$0 --port 3000 "dir/**/*.txt"').demand(1).demand('port').alias('port', 'p').describe('port', 'port on which to listen for WebSocket connections').help('h', 'help').argv;

var port = argv.port;
var globs = argv._;

console.log('Watching for changes to ' + globs.join(', ') + '.');

io.on('connection', function (socket) {
    var watcher = chokidar.watch(globs);

    var changedFiles = {}; // set as object
    var sendChanges = debounce(function () {
        socket.emit('files changed', Object.keys(changedFiles));
        changedFiles = {};
    }, 250);
    var handler = function handler(name) {
        console.log('Changed: ' + name);
        changedFiles[name] = true;
        sendChanges();
    };

    watcher.on('ready', function () {
        watcher.on('add', handler);
        watcher.on('change', handler);
    });

    socket.on('disconnect', function () {
        watcher.close();
    });
});

app.get('/_api/ping', function (req, res) {
    res.setHeader('content-type', 'text/plain');
    res.send('pong');
});

http.listen(port, function () {
    console.log('Server started on port ' + port + '.');
});
