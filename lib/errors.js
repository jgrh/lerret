"use strict";

const util = require("util");

function LerretError() {
    this.name = "LerretError";
    this.message = util.format.apply(null, arguments);
}
util.inherits(LerretError, Error);

module.exports.LerretError = LerretError;
