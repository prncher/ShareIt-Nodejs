"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base = require('./base');
var Q = require("q");
var jwt = require('./jwtManage');
var Student = (function () {
    function Student(student) {
        var _this = this;
        this.censorStudent = function () {
            _this.password = "***";
        };
        this.id = student.id;
        this.firstName = student.firstName;
        this.lastName = student.lastName;
        this.userName = student.userName;
        this.password = student.password;
    }
    return Student;
}());
var StudentController = (function (_super) {
    __extends(StudentController, _super);
    function StudentController(app, da) {
        var _this = this;
        _super.call(this);
        this.postStudent = function () {
            var da = _this.dataAccess;
            var em = _this.sendErrorMessage;
            return function (req, res) {
                var student = new Student(req.body);
                if (student != null) {
                    da.getStudent(student).then(function (result) {
                        if (result) {
                            return em(res, { name: "Error", message: "A user with same username exist" });
                        }
                        da.getStudentsCount().then(function (count) {
                            student.id = count + 1;
                            da.insertStudent(student).then(function (reult) {
                                res.sendStatus(201);
                            }).catch(function (e) {
                                return em(res, e);
                            });
                        }).catch(function (e) {
                            return em(res, e);
                        });
                    }).catch(function (e) {
                        return em(res, e);
                    });
                }
                else {
                    em(res);
                }
            };
        };
        this.getStudent = function () {
            var da = _this.dataAccess;
            var em = _this.sendErrorMessage;
            return function (req, res) {
                var student = new Student(JSON.parse(req.query.user));
                da.getStudent(student).then(function (result) {
                    if (result) {
                        student = new Student(result);
                        student.censorStudent();
                        res.status(200).json({
                            "student": student,
                            "token": jwt.JwtManager.GetToken(student)
                        });
                    }
                    else {
                        return em(res, { name: "Error", message: "User not found" });
                    }
                }).catch(function (e) {
                    return em(res, e);
                });
            };
        };
        this.dataAccess = da;
        app.get("/api/Students", this.getStudent());
        app.post("/api/Students", this.postStudent());
    }
    return StudentController;
}(base.baseController));
exports.StudentController = StudentController;
//# sourceMappingURL=student.js.map