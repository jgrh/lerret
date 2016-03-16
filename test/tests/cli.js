"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

describe("cli", function() {
    //system under test
    const sut = require("../../lib/cli");

    const commander = require("commander");
    const generate = require("../../lib/generate");
    const log = require("../../lib/log");
    const init = require("../../lib/init");

    const sandbox = sinon.sandbox.create();

    //stubs
    let generateCommand;
    let helpCommand;
    let increaseLogVerbosity;
    let initCommand;

    beforeEach(function () {
        generateCommand = sandbox.stub(generate, "generate");
        helpCommand = sandbox.stub(commander, "help");
        increaseLogVerbosity = sandbox.stub(log, "increaseVerbosity");
        initCommand = sandbox.stub(init, "init");
    });

    afterEach(function () {
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
});
