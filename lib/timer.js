"use strict";

let format = require("pretty-hrtime");

function create() {
    const events = {};
    return {
        since: function (event) {
            return format(process.hrtime(events[event]));
        },
        stamp: function (event) {
            events[event] = process.hrtime();
            return this;
        }
    };
}

module.exports.create = create;
