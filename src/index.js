const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const debounce = require('debounce');

const chokidar = require('chokidar');  // file watching


// Root directory to watch for file changes.
const watchDir = 'javascript';  // run from parent dir
const watchGlob = watchDir + '/**/*.jsx';

io.on('connection', socket => {
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

const port = 3000;
http.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});
