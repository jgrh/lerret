"use strict";

const winston = require("winston");

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            level: "info",
            prettyPrint: true
        })
    ]
});

logger.cli();

function increaseVerbosity() {
    switch (logger.transports.console.level) {
    case "info":
        logger.transports.console.level = "debug";
        break;
    case "debug":
        logger.transports.console.level = "verbose";
        break;
    }
}

module.exports = logger;
module.exports.increaseVerbosity = increaseVerbosity;
