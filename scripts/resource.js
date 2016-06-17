"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base = require('./base');
var jwt = require('./jwtManage');
var Q = require("q");
var Resource = (function () {
    function Resource(res) {
        this.id = res.id;
        this.studentId = res.studentId;
        this.resource = res.resource;
    }
    return Resource;
}());
var ResourceController = (function (_super) {
    __extends(ResourceController, _super);
    function ResourceController(app, da) {
        var _this = this;
        _super.call(this);
        this.postResource = function () {
            var self = _this;
            return function (req, res) {
                jwt.JwtManager.Authenticate(req.headers['authorization']).then(function (decoded) {
                    var da = self.dataAccess;
                    var em = self.sendErrorMessage;
                    var resbody = new Resource(req.body);
                    if (resbody != null) {
                        da.getResourcesCount().then(function (count) {
                            resbody.id = count + 1;
                            da.insertResource(resbody).then(function (reult) {
                                self.socket.emit('resource', { studentId: resbody.studentId, resourceId: resbody.id });
                                res.sendStatus(201);
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
                }).catch(function (e) {
                    return res.status(401).json('Failed to authenticate token.');
                });
            };
        };
        this.getResources = function () {
            var da = _this.dataAccess;
            var em = _this.sendErrorMessage;
            return function (req, res) {
                jwt.JwtManager.Authenticate(req.headers['authorization']).then(function (decoded) {
                    var studentId = parseInt(req.query.studentId);
                    da.getResources(studentId).then(function (result) {
                        if (result) {
                            res.status(200).json(result);
                        }
                        else {
                            return em(res, { name: "Error", message: "Resource not found" });
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
        app.get("/api/Resource", this.getResources());
        app.post("/api/Resource", this.postResource());
    }
    return ResourceController;
}(base.baseController));
exports.ResourceController = ResourceController;
//# sourceMappingURL=resource.js.map