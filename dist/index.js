/* eslint-disable no-console */

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const debounce = require('debounce');
const chokidar = require('chokidar'); // file watching

const argv = require('yargs').usage('Usage: $0 --port <port> <globs-to-watch> [ ... ]').example('$0 --port 3000 "dir/**/*.txt"').demand(1).demand('port').alias('port', 'p').describe('port', 'port on which to listen for WebSocket connections').help('h', 'help').argv;

const { port, _: globs } = argv;

console.log(`Watching for changes to ${globs.join(", ")}.`);

io.on('connection', socket => {
    const watcher = chokidar.watch(globs);

    let changedFiles = {}; // set as object
    const sendChanges = debounce(() => {
        socket.emit("files changed", Object.keys(changedFiles));
        changedFiles = {};
    }, 250);
    const handler = name => {
        console.log("Changed: " + name);
        changedFiles[name] = true;
        sendChanges();
    };

    watcher.on('ready', () => {
        watcher.on('add', handler);
        watcher.on('change', handler);
    });

    socket.on('disconnect', () => {
        watcher.close();
    });
});

app.get('/_api/ping', function (req, res) {
    res.setHeader('content-type', 'text/plain');
    res.send('pong');
});

http.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});
