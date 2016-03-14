import express = require('express');
import da = require('./dal');
import base = require('./base');

var Q = require("q");
var multer = require('multer');
var fs = require('fs');
var mime = require('mime');

interface IFileData {
    name: string;
    studentId: string;
    link: string;
}

class FileData implements IFileData {
    public name: string;
    public studentId: string;
    public link: string;

    constructor(fd: IFileData) {
        this.name = fd.name;
        this.studentId = fd.studentId;
        this.link = fd.link;
    }
}

export class FileController extends base.baseController {
    // Max file upload size 20MB, only one file at a time.
    uploading = multer({
        dest: './tmp/',
        limits: { fileSize: 20000000, files: 1 },
    }).single('file');
    fileFolder: string = "./uploads/";

    constructor(app: express.Express, da: da.DataAccess) {
        super();
        this.dataAccess = da;
        app.use(this.uploading); app.get("/api/Files", this.getFiles());
        app.post("/api/Files", this.postFile());
    }

    // Post a File
    postFile = (): any => {
        var self = this;
        return (req: any, res: express.Response) => {
            console.log(req.file.filename);
            console.log(req.file.path);
            console.log(req.file.size);
            var tokens = req.file.originalname.split('<');
            var folder = this.fileFolder + tokens[0];
            console.log('Student ID : ' + tokens[0] + ' file : ' + tokens[1]);
            fs.exists(folder, (exists: boolean) => {
                if (exists) {
                    //(res: express.Response, folder : string, fileName : string, studentId : string, file : string)
                    this.renameFile(res, req.file.filename, tokens[0], tokens[1], self.sendErrorMessage, self.socket);
                }
                else {
                    fs.mkdir(folder, (err) => {
                        if (err) {
                            console.log(err);
                            res.status(err.status).end();
                        }
                        else {
                            this.renameFile(res, req.file.filename, tokens[0], tokens[1], self.sendErrorMessage, self.socket);
                        }
                    });
                }
            });
        };
    }

    // get all the file infos for this student.
    getFiles = (): any => {
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            var studentId: number = parseInt(req.query.studentId);
            var fileName: string = req.query.fileName;
            if (studentId) {
                var fullPath: string = this.fileFolder + studentId + '/';

                if (fileName) {
                    this.sendFileWithMime(res, fullPath, fileName, em);
                }
                else {
                    fs.exists(fullPath, (exists: boolean) => {
                        if (exists) {
                            fs.readdir(fullPath, (err: NodeJS.ErrnoException, files: string[]) => {
                                if (err) {
                                    console.log(err);
                                    return em(res, err);
                                }
                                else {
                                    var fds: Array<FileData> = new Array<FileData>();
                                    files.forEach((value: string, index: number, array: string[]) => {
                                        fds.push({
                                            studentId: studentId.toString(),
                                            name: value,
                                            link: '/api/Files?studentId=' + studentId + '&fileName=' + value
                                        });
                                    });

                                    res.status(200).json(fds)
                                }

                            });
                        } else {
                            fs.mkdir(fullPath, (err) => {
                                if (err) {
                                    console.log(err);
                                    res.status(err.status).end();
                                }
                            });
                        }
                    });
                }
            }

        };
    }

    renameFile = (res: express.Response, originalFileName: string, studentId: string, fileName: string, em: Function, socket: any): void => {
        var folder = this.fileFolder + studentId;
        fs.rename('./tmp/' + originalFileName, folder + '/' + fileName, function (err, data) {
            if (err) {
                console.log(err);
                return em(res, err);
            } else {
                var fd: IFileData = new FileData(
                    {
                        studentId: studentId,
                        name: fileName,
                        link: '/api/Files?studentId=' + studentId + '&fileName=' + fileName
                    });

                res.status(201).json(fd);
                socket.emit('file', fd);
            }
        });
    }

    sendFileWithMime = (res: express.Response, fullPath: string, fileName: string, em: Function) => {
        var mimetype = mime.lookup(fullPath + fileName);

        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', mimetype);

        var filestream = fs.createReadStream(fullPath + fileName);
        filestream.pipe(res);
    }
}