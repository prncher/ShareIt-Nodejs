"uses strict"
var http = require('http');
import express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

import st = require('./student');
import bd = require('./buddy');
import da = require('./dal');
import rs = require('./resource');
import fl = require('./file');

var app = express();
app.use(express.static("../ShareIt-Client"));
var server = http.Server(app);
var io = require('socket.io')(server);
var port = process.env.port || 8080;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    fs.readFile('index.html',
        (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
});

// Create Student controller
var dataAccess = new da.DataAccess()
var studentController = new st.StudentController(app, dataAccess);
var buddyController = new bd.BuddyController(app, dataAccess);
var resourceController = new rs.ResourceController(app, dataAccess);
var fileController = new fl.FileController(app, dataAccess);

io.on('connection', (socket) => {
    console.log('a user connected');
    dataAccess.openDbConnection();

    resourceController.setSocket(socket);
    fileController.setSocket(socket);

    socket.on('disconnect', function () {
        dataAccess.closeDbConnection();
        console.log('user disconnected');
    });
});

server.listen(port, _ => {
    console.log('listening on *: ' + port);
});
