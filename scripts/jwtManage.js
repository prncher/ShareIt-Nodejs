"uses strict";
"use strict";
var fs = require('fs');
var jwt = require('jsonwebtoken');
var Q = require("q");
var JwtManager = (function () {
    function JwtManager() {
    }
    JwtManager.publicKey = JSON.stringify({ 'key': fs.readFileSync('key.pub', 'UTF8'), 'now': Date.now() });
    JwtManager.GetToken = function (student) {
        if (student !== undefined) {
            JwtManager.token = jwt.sign(student, JwtManager.publicKey);
        }
        return JwtManager.token;
    };
    JwtManager.Authenticate = function (token) {
        var deferred = Q.defer();
        if (token && token.split(' ')[0] === 'Bearer') {
            token = token.split(' ')[1];
            jwt.verify(token, JwtManager.publicKey, function (err, decoded) {
                if (err) {
                    deferred.reject(new Error('Failed to authenticate token.'));
                }
                else {
                    deferred.resolve(decoded);
                }
            });
        }
        else {
            deferred.reject(new Error('Authenticate token not present'));
        }
        return deferred.promise;
    };
    return JwtManager;
}());
exports.JwtManager = JwtManager;
//# sourceMappingURL=jwtManage.js.map