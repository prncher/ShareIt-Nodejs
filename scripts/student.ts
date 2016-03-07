import express = require('express');
import da = require('./dal');
import base = require('./base');
var Q = require("q");

export interface IStudent {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
}

class Student implements IStudent {
    public id: number;
    public firstName: string;
    public lastName: string;
    public userName: string;
    public password: string;

    constructor(student: IStudent) {
        this.id = student.id;
        this.firstName = student.firstName;
        this.lastName = student.lastName;
        this.userName = student.userName;
        this.password = student.password;
    }
}

export class StudentController extends base.baseController {
    constructor(app: express.Express, da: da.DataAccess) {
        super();
        this.dataAccess = da;
        app.get("/api/Students", this.getStudent());
        app.post("/api/Students", this.postStudent());
    }

    // Register Student
    postStudent = (): any => {
        var da = this.dataAccess;
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            var student = new Student(<IStudent>req.body);
            if (student != null) {
                da.getStudent(student.userName).then((result) => {
                    if (result) {
                        return em(res, { name: "Error", message: "A user with same username exist" });
                    }

                    da.getStudentsCount().then((count) => {
                        student.id = count + 1;
                        da.insertStudent(student).then((reult) => {
                            res.sendStatus(201);
                        }).catch((e) => {
                            return em(res, e);
                        });
                    }).catch((e) => {
                        return em(res, e);
                    });
                }).catch(e => {
                    return em(res, e);
                });
            }
            else {
                em(res);
            }
        }
    }

    getStudent = (): any => {
        var da = this.dataAccess;
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            da.getStudent(req.query.userName).then((result) => {
                if (result) {
                    res.json(result);
                }
                else {
                    return em(res, { name: "Error", message: "User not found" });
                }
            }).catch(e => {
                return em(res, e);
            });
        }
    }

}
