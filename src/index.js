const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const debounce = require('debounce');
const chokidar = require('chokidar');  // file watching

const argv = require('yargs')
    .usage('Usage: $0 --port <port> --directory <dir> --extension <ext>')
    .example('$0 --port 3000 --directory javascript --extension jsx')
    .demand('port')
    .alias('port', 'p')
    .describe('port', 'port on which to listen for WebSocket connections')
    .demand('directory')
    .alias('directory', 'd')
    .describe('directory', 'directory to watch for changes (recursively)')
    .demand('extension')
    .alias('extension', 'e')
    .describe('extension', 'file extension to watch')
    .help('h', 'help')
    .argv;

const {port, directory, extension} = argv;

console.log(`Watching "${directory}" for changes to .${extension} files.`);

io.on('connection', socket => {
    const watchGlob = directory + '/**/*.' + extension;
    const watcher = chokidar.watch(watchGlob);

    let changedFiles = {};  // set as object
    const sendChanges = debounce(() => {
        socket.emit("files changed", Object.keys(changedFiles));
        changedFiles = {};
    }, 250);
    const handler = (name) => {
        console.log("Saw a change!");
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

http.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});
