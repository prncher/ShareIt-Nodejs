"use strict";
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Q = require("q");
var DataAccess = (function () {
    function DataAccess() {
        this.dbConnection = null;
    }
    DataAccess.prototype.openDbConnection = function () {
        var _this = this;
        if (this.dbConnection == null) {
            MongoClient.connect(DataAccess.shareItUrl, function (err, db) {
                assert.equal(null, err);
                console.log("Connected correctly to MongoDB server.");
                _this.dbConnection = db;
            });
        }
    };
    DataAccess.prototype.closeDbConnection = function () {
        if (this.dbConnection) {
            this.dbConnection.close();
            this.dbConnection = null;
        }
    };
    DataAccess.prototype.getStudentsCount = function () {
        return this.getDocumentCount('Students');
    };
    DataAccess.prototype.getBuddiesCount = function () {
        return this.getDocumentCount('Buddies');
    };
    DataAccess.prototype.getResourcesCount = function () {
        return this.getDocumentCount('Resources');
    };
    DataAccess.prototype.insertStudent = function (student) {
        return this.insertDocument(student, 'Students');
    };
    DataAccess.prototype.insertBuddy = function (buddy) {
        return this.insertDocument(buddy, 'Buddies');
    };
    DataAccess.prototype.insertResource = function (resource) {
        return this.insertDocument(resource, 'Resources');
    };
    DataAccess.prototype.getStudent = function (user) {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Students').find();
            cursor.each(function (err, document) {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null &&
                    document['userName'] === user.userName &&
                    document['password'] === user.password) {
                    return deferred.resolve(document);
                }
                else if (document === null) {
                    return deferred.resolve(document);
                }
            });
        }
        return deferred.promise;
    };
    DataAccess.prototype.getBuddies = function (studentId) {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Buddies').find();
            var buddies = new Array();
            cursor.each(function (err, document) {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null && document['studentId'] === studentId) {
                    buddies.push(document);
                }
                else if (document === null) {
                    deferred.resolve(buddies);
                }
            });
        }
        return deferred.promise;
    };
    DataAccess.prototype.getBuddiesAsStudent = function (studentId) {
        var _this = this;
        var deferred = Q.defer();
        var deferred2 = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Buddies').find();
            var students = new Array();
            cursor.each(function (err, document) {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null && document['studentId'] === studentId) {
                    var stcursor = _this.dbConnection.collection('Students').find();
                    stcursor.each(function (err, document2) {
                        assert.equal(err, null);
                        if (err) {
                            deferred.reject(new Error(JSON.stringify(err)));
                        }
                        else if (document2 !== null && document2['id'] === document['buddyId']) {
                            students.push(document2);
                        }
                        else if (document2 === null) {
                            deferred2.promise.then(function (r) {
                                deferred.resolve(students);
                            });
                        }
                    });
                }
                else if (document === null) {
                    deferred2.resolve("Done");
                }
            });
        }
        return deferred.promise;
    };
    DataAccess.prototype.getResources = function (studentId) {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Resources').find();
            var resources = new Array();
            cursor.each(function (err, document) {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null && document['studentId'] === studentId) {
                    resources.push(document);
                }
                else if (document === null) {
                    deferred.resolve(resources);
                }
            });
        }
        return deferred.promise;
    };
    DataAccess.prototype.insertDocument = function (document, collectionName) {
        var deferred = Q.defer();
        this.dbConnection.collection(collectionName).insertOne(document, function (err, result) {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    };
    DataAccess.prototype.getDocumentCount = function (collectionName) {
        var deferred = Q.defer();
        this.dbConnection && this.dbConnection.collection(collectionName).count(function (err, result) {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    };
    DataAccess.shareItUrl = 'mongodb://127.0.0.1:27017/ShareIt';
    return DataAccess;
}());
exports.DataAccess = DataAccess;
//# sourceMappingURL=dal.js.map