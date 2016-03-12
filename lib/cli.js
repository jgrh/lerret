"use strict";

const generate = require("./generate");
const log = require("./log");
const init = require("./init");
const program = require("commander");
const version = require("../package.json").version;

module.exports = function() {
    program.version(version);

    program.command("generate")
        .description("Generate site.")
        .option("-v, --verbose", "Enable verbose logging.", log.increaseVerbosity)
        .action(generate.generate);

    program.command("init")
        .description("Initialize a new project.")
        .option("-v, --verbose", "Enable verbose logging.", log.increaseVerbosity)
        .action(init.init);

    if (process.argv.length === 2) {
        program.help();
    }

    program.parse(process.argv);
};
