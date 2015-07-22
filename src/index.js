const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const debounce = require('debounce');
const chokidar = require('chokidar');  // file watching

/*
 * Usage:
 *   node hotload-server/index.js <port> <directory> <extension>
 */
const args = process.argv.slice(2);
const port = parseInt(args[0]);
const watchDir = args[1];           // e.g., "javascript"
const extension = args[2];          // e.g., "jsx"

console.log(`Watching "${watchDir}" for changes to .${extension} files.`);

io.on('connection', socket => {
    const watchGlob = watchDir + '/**/*.' + extension;
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
