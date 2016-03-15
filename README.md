# hotload-server

This minimalistic server watches for changes to files, then notifies a browser over a WebSocket.

## Usage

```bash
npm install    # once (per clone)
npm run build  # once (per clone, or again if you change the code)
node dist/index.js --port 3000 'javascript/**/*.jsx' 'stylesheets/**/*.css'
```

## Client-side API

Use the [socket.io](http://socket.io) library, and expect the "files changed" event to give you an array:

```javascript
var server = "http://localhost:3000";
$.getScript(server + "/socket.io/socket.io.js").done(function() {
    // Open a connection.
    var socket = io(server);

    // Listen for the event.
    socket.on("files changed", function(changed) {
        // changed :: [string]
        console.log("Number of files changed: " + changed.length);
    });
});
```
