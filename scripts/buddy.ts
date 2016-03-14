import express = require('express');
import da = require('./dal');
import base = require('./base');
var Q = require("q");

export interface IBuddy {
    id: number;
    studentId: number;
    buddyId: number;
}

class Buddy implements IBuddy {
    public id: number;
    public studentId: number;
    public buddyId: number;

    constructor(buddy: IBuddy) {
        this.id = buddy.id;
        this.studentId = buddy.studentId;
        this.buddyId = buddy.buddyId;
    }
}

export class BuddyController extends base.baseController {
    constructor(app: express.Express, da: da.DataAccess) {
        super();
        this.dataAccess = da;
        app.get("/api/Buddies", this.getBuddies());
        app.post("/api/Buddies", this.postBuddy());
    }

    // Register Buddy
    postBuddy = (): any => {
        var da = this.dataAccess;
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            var buddy = new Buddy(<IBuddy>req.body);
            if (buddy != null) {
                if (buddy.buddyId == buddy.studentId) {
                    return em(res, { name: "Error", message: "A buddy can not be same as user." });
                }

                // Get all the buddies for this student.
                da.getBuddies(buddy.studentId).then((result) => {
                    var buddyExist = false;
                    result.forEach((bud, index) => {
                        if (bud.buddyId === buddy.buddyId) {
                            buddyExist = true;
                            return em(res, { name: "Error", message: "This buddy is added before." });
                        }
                    });

                    if (!buddyExist) {
                        da.getBuddiesCount().then((count) => {
                            buddy.id = count + 1;
                            da.insertBuddy(buddy).then((reult) => {
                                res.sendStatus(201);
                            }).catch((e) => {
                                return em(res, e);
                            });
                        }).catch((e) => {
                            return em(res, e);
                        });
                    }

                }).catch((e) => {
                    return em(res, e);
                });
            }
            else {
                em(res);
            }
        }
    }

    // Get all buddies
    getBuddies = (): any => {
        var da = this.dataAccess;
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            // Get all the buddies for this student.
            var studentId: number = parseInt(req.query.studentId);
            da.getBuddiesAsStudent(studentId).then((result) => {
                if (result) {
                    res.status(200).json(result);
                }
                else {
                    return em(res, { name: "Error", message: "Buddies not found" });
                }
            }).catch(e => {
                return em(res, e);
            });
        }
    }
}
