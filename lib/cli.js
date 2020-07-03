"use strict";

const generate = require("./generate");
const log = require("./log");
const init = require("./init");
const print = require("./print");
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

    program.command("print")
        .description("Print site content.")
        .option("--no-color", "Don't colorize output.")
        .option("--no-exif", "Exclude image exif tags from output.")
        .action(print.print);

    if (process.argv.length === 2) {
        program.help();
    }

    program.parse(process.argv);
};
