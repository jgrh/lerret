"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

describe("cli", function() {
    //system under test
    let sut;

    const commander = require("commander");
    const generate = require("../../lib/generate");
    const log = require("../../lib/log");
    const init = require("../../lib/init");
    const print = require("../../lib/print");

    const sandbox = sinon.sandbox.create();

    //stubs
    let generateCommand;
    let helpCommand;
    let increaseLogVerbosity;
    let initCommand;
    let printCommand;

    beforeEach(function () {
        sut = require("../../lib/cli");
        generateCommand = sandbox.stub(generate, "generate");
        helpCommand = sandbox.stub(commander, "help");
        increaseLogVerbosity = sandbox.stub(log, "increaseVerbosity");
        initCommand = sandbox.stub(init, "init");
        printCommand = sandbox.stub(print, "print");
    });

    afterEach(function () {
        delete require.cache[require.resolve("../../lib/cli")];
        delete require.cache[require.resolve("commander")];
        sandbox.restore();
    });

    it("should print help if no command is supplied", function () {
        process.argv = [ "", "" ];

        sut();

        helpCommand.should.be.calledOnce;
    });

    describe("generate command", function () {
        it("should call generate module", function () {
            process.argv = [ "", "", "generate" ];

            sut();

            generateCommand.should.be.calledOnce;
        });

        it("-v option should increase logging verbosity", function () {
            process.argv = [ "", "", "generate", "-v" ];

            sut();

            increaseLogVerbosity.should.be.called;
        });
    });

    describe("init command", function () {
        it("should call init module", function () {
            process.argv = [ "", "", "init" ];

            sut();

            initCommand.should.be.calledOnce;
        });

        it("-v option should increase logging verbosity", function () {
            process.argv = [ "", "", "init", "-v" ];

            sut();

            increaseLogVerbosity.should.be.called;
        });
    });

    describe("print command", function () {
        it("should call print module", function () {
            process.argv = [ "", "", "print" ];

            sut();

            printCommand.should.be.calledOnce;
        });

        it("should pass --no-color argument to print module", function () {
            process.argv = [ "", "", "print", "--no-color" ];

            sut();

            printCommand.should.be.calledWith(sinon.match.has("color", false));
        });

        it("should pass --no-exif argument to print module", function () {
            process.argv = [ "", "", "print", "--no-exif" ];

            sut();

            printCommand.should.be.calledWith(sinon.match.has("exif", false));
        });
    });
});
