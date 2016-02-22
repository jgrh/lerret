"use strict";

const generate = require("./generate");
const log = require("./log");
const init = require("./init");
const program = require("commander");

module.exports = function() {
    program.version("0.0.1");

    program.command("generate")
        .description("Generate site.")
        .option("-v, --verbose", "Enable verbose logging.", log.increaseVerbosity)
        .action(generate.generate);

    program.command("init")
        .description("Initialize a new project.")
        .option("-v, --verbose", "Enable verbose logging.", log.increaseVerbosity)
        .action(init.init);

    program.parse(process.argv);
};
