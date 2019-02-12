"use strict";

const winston = require("winston");
const _ = require("lodash");

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4
};

const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    verbose: "blue",
    debug: "cyan"
};

winston.addColors(colors);

const logger = new winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.cli()
    ),
    level: "info",
    levels: levels,
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
        })
    ]
});

function increaseVerbosity() {
    setLevel(_.findKey(levels, value => {
        return value === levels[logger.level] + 1;
    }));
}

function setLevel(level) {
    if (_.has(levels, level)) {
        logger.level = level;
    }
}

module.exports = logger;
module.exports.increaseVerbosity = increaseVerbosity;
module.exports.setLevel = setLevel;
