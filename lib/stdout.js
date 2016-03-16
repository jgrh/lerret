"use strict";

const os = require("os");

function write(data) {
    process.stdout.write(data + os.EOL);
}

module.exports.write = write;
