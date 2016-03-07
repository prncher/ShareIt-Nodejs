"uses strict"
var http = require('http');
//var app = require('express');
import express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
import st = require('./student');
import da = require('./dal');

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

io.on('connection', (socket) => {
    console.log('a user connected');
    dataAccess.openDbConnection();

    socket.on('disconnect', function () {
        dataAccess.closeDbConnection();
        console.log('user disconnected');
    });
});

server.listen(port, _ => {
    console.log('listening on *: ' + port);
});
