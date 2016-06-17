"uses strict";
"use strict";
var http = require('http');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');
var st = require('./student');
var bd = require('./buddy');
var da = require('./dal');
var rs = require('./resource');
var fl = require('./file');
var jwt = require('./jwtManage');
var app = express();
app.use(express.static("../ShareIt-Client"));
app.use(expressJWT({ secret: jwt.JwtManager.publicKey }).unless({
    path: ['/', '/api/Students', '/api/Files']
}));
var server = http.Server(app);
var io = require('socket.io')(server);
var port = process.env.port || 8080;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', function (req, res) {
    fs.readFile('index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
});
var dataAccess = new da.DataAccess();
var studentController = new st.StudentController(app, dataAccess);
var buddyController = new bd.BuddyController(app, dataAccess);
var resourceController = new rs.ResourceController(app, dataAccess);
var fileController = new fl.FileController(app, dataAccess);
io.on('connection', function (socket) {
    console.log('a user connected');
    dataAccess.openDbConnection();
    resourceController.setSocket(socket);
    fileController.setSocket(socket);
    socket.on('disconnect', function () {
        dataAccess.closeDbConnection();
        console.log('user disconnected');
    });
});
server.listen(port, function (_) {
    console.log('listening on *: ' + port);
});
//# sourceMappingURL=server.js.map