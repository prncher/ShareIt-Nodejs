"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base = require('./base');
var jwt = require('./jwtManage');
var Q = require("q");
var Buddy = (function () {
    function Buddy(buddy) {
        this.id = buddy.id;
        this.studentId = buddy.studentId;
        this.buddyId = buddy.buddyId;
    }
    return Buddy;
}());
var BuddyController = (function (_super) {
    __extends(BuddyController, _super);
    function BuddyController(app, da) {
        var _this = this;
        _super.call(this);
        this.postBuddy = function () {
            var da = _this.dataAccess;
            var em = _this.sendErrorMessage;
            return function (req, res) {
                jwt.JwtManager.Authenticate(req.headers['authorization']).then(function (decoded) {
                    var buddy = new Buddy(req.body);
                    if (buddy != null) {
                        if (buddy.buddyId == buddy.studentId) {
                            return em(res, { name: "Error", message: "A buddy can not be same as user." });
                        }
                        da.getBuddies(buddy.studentId).then(function (result) {
                            var buddyExist = false;
                            result.forEach(function (bud, index) {
                                if (bud.buddyId === buddy.buddyId) {
                                    buddyExist = true;
                                    return em(res, { name: "Error", message: "This buddy is added before." });
                                }
                            });
                            if (!buddyExist) {
                                da.getBuddiesCount().then(function (count) {
                                    buddy.id = count + 1;
                                    da.insertBuddy(buddy).then(function (reult) {
                                        res.sendStatus(201);
                                    }).catch(function (e) {
                                        return em(res, e);
                                    });
                                }).catch(function (e) {
                                    return em(res, e);
                                });
                            }
                        }).catch(function (e) {
                            return em(res, e);
                        });
                    }
                    else {
                        em(res);
                    }
                }).catch(function (e) {
                    return res.status(401).json('Failed to authenticate token.');
                });
            };
        };
        this.getBuddies = function () {
            var da = _this.dataAccess;
            var em = _this.sendErrorMessage;
            return function (req, res) {
                jwt.JwtManager.Authenticate(req.headers['authorization']).then(function (decoded) {
                    var studentId = parseInt(req.query.studentId);
                    da.getBuddiesAsStudent(studentId).then(function (result) {
                        if (result) {
                            res.status(200).json(result);
                        }
                        else {
                            return em(res, { name: "Error", message: "Buddies not found" });
                        }
                    }).catch(function (e) {
                        return em(res, e);
                    });
                }).catch(function (e) {
                    return res.status(401).json('Failed to authenticate token.');
                });
            };
        };
        this.dataAccess = da;
        app.get("/api/Buddies", this.getBuddies());
        app.post("/api/Buddies", this.postBuddy());
    }
    return BuddyController;
}(base.baseController));
exports.BuddyController = BuddyController;
//# sourceMappingURL=buddy.js.map