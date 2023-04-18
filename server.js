/*
 * server.js
 */

/* Required libraries for creating the application */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: /^https?:\/\/(?:www\.)?twitch\.tv\/?.*$/,
        methods: ['GET', 'POST']
    }
});

/*
 * Configure Socket.IO to listen for new connections.
 */
io.on('connection', function(socket) {
    try {
        socket.emit('onopen', true);
    } catch (err) {
        console.error(err);
    }

    // Receive the name of the channel in the connection event
    socket.on('join_channel', function(canal) {
        try {
            console.log(`A new user joined the channel: ${canal}`);
            // Add the client to the corresponding channel
            socket.join(canal);
        } catch (err) {
            console.error(err);
        }
    });

    /*
     * Every new connection should listen for the 'new message' event,
     * which is triggered every time a user sends a message.
     * 
     * @param msj : The data sent from the client through the socket.
     */
    socket.on('new_message', function(data) {
        try {
            const regexForStripHTML = /<.*>.*?/ig;
            data.msj = data.msj.replace(regexForStripHTML, '');
            if (data.msj !== '' && data.username !== '') {
                console.log(`${data.username} wrote a new message in ${data.canal}`);
                io.to(data.canal).emit('new_message', data.username, data.msj);
            }
        } catch (err) {
            console.error(err);
        }
    });

    /*
     * Print to console every time a user disconnects from the system.
     */
    socket.on('disconnect', function() {
        try {
            console.log('User disconnected');
        } catch (err) {
            console.error(err);
        }
    });
});

/*
 * Start the application on port 80
 */
http.listen(80, function() {
    console.log('listening on *:80');
});
