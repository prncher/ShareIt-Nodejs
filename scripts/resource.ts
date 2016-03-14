import express = require('express');
import da = require('./dal');
import base = require('./base');

var Q = require("q");

export interface IResource {
    id: number;
    studentId: number;
    resource: Array<number>;
}

class Resource implements IResource {
    public id: number;
    public studentId: number;
    public resource: Array<number>;

    constructor(res: IResource) {
        this.id = res.id;
        this.studentId = res.studentId;
        this.resource = res.resource;
    }
}

export class ResourceController extends base.baseController {
    constructor(app: express.Express, da: da.DataAccess) {
        super();
        this.dataAccess = da;
        app.get("/api/Resource", this.getResources());
        app.post("/api/Resource", this.postResource());
    }

    // Post a Resource
    postResource = (): any => {
        var self = this;
        return (req: express.Request, res: express.Response) => {
            var da = self.dataAccess;
            var em = self.sendErrorMessage;
            var resbody = new Resource(<IResource>req.body);
            if (resbody != null) {
                da.getResourcesCount().then((count) => {
                    resbody.id = count + 1;
                    da.insertResource(resbody).then((reult) => {
                        self.socket.emit('resource', { studentId: resbody.studentId, resourceId: resbody.id });
                        res.sendStatus(201);
                    }).catch((e) => {
                        return em(res, e);
                    });
                }).catch((e) => {
                    return em(res, e);
                });
            }
            else {
                em(res);
            }

        };
    }

    // get all contents for a student.
    getResources = (): any => {
        var da = this.dataAccess;
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            // Get all the resources for this student.
            var studentId: number = parseInt(req.query.studentId);
            da.getResources(studentId).then((result) => {
                if (result) {
                    res.status(200).json(result);
                }
                else {
                    return em(res, { name: "Error", message: "Resource not found" });
                }
            }).catch(e => {
                return em(res, e);
            });
        };
    }
}