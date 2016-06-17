"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base = require('./base');
var jwt = require('./jwtManage');
var Q = require("q");
var multer = require('multer');
var fs = require('fs');
var mime = require('mime');
var FileData = (function () {
    function FileData(fd) {
        this.name = fd.name;
        this.studentId = fd.studentId;
        this.link = fd.link;
    }
    return FileData;
}());
var FileController = (function (_super) {
    __extends(FileController, _super);
    function FileController(app, da) {
        var _this = this;
        _super.call(this);
        this.uploading = multer({
            dest: './tmp/',
            limits: { fileSize: 20000000, files: 1 },
        }).single('file');
        this.fileFolder = "./uploads/";
        this.postFile = function () {
            var self = _this;
            return function (req, res) {
                jwt.JwtManager.Authenticate(req.headers['authorization']).then(function (decoded) {
                    console.log(req.file.filename);
                    console.log(req.file.path);
                    console.log(req.file.size);
                    var tokens = req.file.originalname.split('<');
                    var folder = _this.fileFolder + tokens[0];
                    console.log('Student ID : ' + tokens[0] + ' file : ' + tokens[1]);
                    fs.exists(folder, function (exists) {
                        if (exists) {
                            _this.renameFile(res, req.file.filename, tokens[0], tokens[1], self.sendErrorMessage, self.socket);
                        }
                        else {
                            fs.mkdir(folder, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.status(err.status).end();
                                }
                                else {
                                    _this.renameFile(res, req.file.filename, tokens[0], tokens[1], self.sendErrorMessage, self.socket);
                                }
                            });
                        }
                    });
                }).catch(function (e) {
                    return res.status(401).json('Failed to authenticate token.');
                });
            };
        };
        this.getFiles = function () {
            var em = _this.sendErrorMessage;
            var self = _this;
            return function (req, res) {
                var bearerToken;
                if (req.query.token !== undefined) {
                    bearerToken = 'Bearer ' + req.query.token;
                }
                else {
                    bearerToken = req.headers['authorization'];
                }
                jwt.JwtManager.Authenticate(bearerToken).then(function (decoded) {
                    var studentId = parseInt(req.query.studentId);
                    var fileName = req.query.fileName;
                    if (studentId) {
                        var fullPath = _this.fileFolder + studentId + '/';
                        if (fileName) {
                            self.sendFileWithMime(res, fullPath, fileName, em);
                        }
                        else {
                            fs.exists(fullPath, function (exists) {
                                if (exists) {
                                    fs.readdir(fullPath, function (err, files) {
                                        if (err) {
                                            console.log(err);
                                            return em(res, err);
                                        }
                                        else {
                                            var fds = new Array();
                                            files.forEach(function (value, index, array) {
                                                fds.push({
                                                    studentId: studentId.toString(),
                                                    name: value,
                                                    link: '/api/Files?studentId=' + studentId + '&fileName=' + value + '&token=' + jwt.JwtManager.GetToken()
                                                });
                                            });
                                            res.status(200).json(fds);
                                        }
                                    });
                                }
                                else {
                                    fs.mkdir(fullPath, function (err) {
                                        if (err) {
                                            console.log(err);
                                            res.status(404).send(err);
                                        }
                                    });
                                }
                            });
                        }
                    }
                }).catch(function (e) {
                    return res.status(401).json('Failed to authenticate token.');
                });
            };
        };
        this.renameFile = function (res, originalFileName, studentId, fileName, em, socket) {
            var folder = _this.fileFolder + studentId;
            fs.rename('./tmp/' + originalFileName, folder + '/' + fileName, function (err, data) {
                if (err) {
                    console.log(err);
                    return em(res, err);
                }
                else {
                    var fd = new FileData({
                        studentId: studentId,
                        name: fileName,
                        link: '/api/Files?studentId=' + studentId + '&fileName=' + fileName
                    });
                    res.status(201).json(fd);
                    socket.emit('file', fd);
                }
            });
        };
        this.sendFileWithMime = function (res, fullPath, fileName, em) {
            var mimetype = mime.lookup(fullPath + fileName);
            res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
            res.setHeader('Content-type', mimetype);
            var filestream = fs.createReadStream(fullPath + fileName);
            filestream.pipe(res);
        };
        this.dataAccess = da;
        app.use(this.uploading);
        app.get("/api/Files", this.getFiles());
        app.post("/api/Files", this.postFile());
    }
    return FileController;
}(base.baseController));
exports.FileController = FileController;
//# sourceMappingURL=file.js.map