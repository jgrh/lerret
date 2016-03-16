"use strict";

const winston = require("winston");
const _ = require("lodash");

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    verbose: 'cyan'
};

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
logger.setLevels(levels);
winston.addColors(colors);

function increaseVerbosity() {
    setLevel(_.findKey(levels, value => {
        return value === levels[logger.transports.console.level] + 1;
    }));
}

function setLevel(level) {
    if (_.has(levels, level)) {
        logger.transports.console.level = level;
    }
}

module.exports = logger;
module.exports.increaseVerbosity = increaseVerbosity;
module.exports.setLevel = setLevel;
