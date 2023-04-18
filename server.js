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
    socket.emit('onopen', true);

    // Receive the name of the channel in the connection event
    socket.on('join_channel', function(canal) {
        console.log(`A new user joined the channel: ${canal}`);
        // Add the client to the corresponding channel
        socket.join(canal);
    });

    /*
     * Every new connection should listen for the 'new message' event,
     * which is triggered every time a user sends a message.
     * 
     * @param msj : The data sent from the client through the socket.
     */
    socket.on('new_message', function(data) {
        const regexForStripHTML = /<.*>.*?/ig;
        data.msj = data.msj.replaceAll(regexForStripHTML, '');

        if (data.msj !== '' && data.username !== '') {
            console.log(`${data.username} wrote a new message in ${data.canal}`);
            io.to(data.canal).emit('new_message', data.username, data.msj);
        }
    });

    /*
     * Print to console every time a user disconnects from the system.
     */
    socket.on('disconnect', function() {
        console.log('User disconnected');
    });
});

/*
 * Start the application on port 3000
 */
http.listen(3000, function() {
    console.log('listening on *:3000');
});
