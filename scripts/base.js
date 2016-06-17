"use strict";
var baseController = (function () {
    function baseController() {
        var _this = this;
        this.sendErrorMessage = function (res, e) {
            if (e) {
                var ex = JSON.stringify(e);
                return res.status(400).json({ Message: e.message, ExceptionMessage: ex });
            }
            else {
                res.sendStatus(400);
            }
        };
        this.setSocket = function (socket) {
            _this.socket = socket;
        };
    }
    return baseController;
}());
exports.baseController = baseController;
//# sourceMappingURL=base.js.map