var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Q = require("q");

export class DataAccess {
    static shareItUrl: string = 'mongodb://127.0.0.1:27017/ShareIt';
    dbConnection: any = null;

    public openDbConnection() {
        if (this.dbConnection == null) {
            MongoClient.connect(DataAccess.shareItUrl, (err, db) => {
                assert.equal(null, err);
                console.log("Connected correctly to server.");
                this.dbConnection = db;
            });
        }
    }

    public closeDbConnection() {
        if (this.dbConnection) {
            this.dbConnection.close();
            this.dbConnection = null;
        }
    }

    public getStudentsCount(): any {
        return this.getDocumentCount('Students');
    }

    public getBuddiesCount(): any {
        return this.getDocumentCount('Buddies');
    }

    public getResourcesCount(): any {
        return this.getDocumentCount('Resources');
    }

    public insertStudent(student: any): any {
        return this.insertDocument(student, 'Students');
    }

    public insertBuddy(buddy: any): any {
        return this.insertDocument(buddy, 'Buddies');
    }

    public insertResource(resource: any): any {
        return this.insertDocument(resource, 'Resources');
    }


    public getStudent(userName: string): any {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Students').find();
            cursor.each((err, document) => {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null && document['userName'] === userName) {
                    return deferred.resolve(document);
                }
                else if (document === null) {
                    return deferred.resolve(document);
                }
            });
        }

        return deferred.promise;
    }

    public getBuddies(studentId: number): any {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Buddies').find();
            var buddies: Array<any> = new Array<any>();
            cursor.each((err, document) => {
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
    }

    public getBuddiesAsStudent(studentId: number): any {
        var deferred = Q.defer();
        var deferred2 = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Buddies').find();
            var students: Array<any> = new Array<any>();
            cursor.each((err, document) => {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null && document['studentId'] === studentId) {
                    var stcursor = this.dbConnection.collection('Students').find();
                    stcursor.each((err, document2) => {
                        assert.equal(err, null);
                        if (err) {
                            deferred.reject(new Error(JSON.stringify(err)));
                        }
                        else if (document2 !== null && document2['id'] === document['buddyId']) {
                            students.push(document2);
                        }
                        else if (document2 === null) {
                            deferred2.promise.then((r) => {
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
    }

    public getResources(studentId: number): any {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Resources').find();
            var resources: Array<any> = new Array<any>();
            cursor.each((err, document) => {
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
    }

    private insertDocument(document: any, collectionName: string): any {
        var deferred = Q.defer();
        this.dbConnection.collection(collectionName).insertOne(document, (err, result) => {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    private getDocumentCount(collectionName: string): any {
        var deferred = Q.defer();
        this.dbConnection && this.dbConnection.collection(collectionName).count((err, result) => {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    }
}