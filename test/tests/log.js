"use strict";

/*global describe, it*/

const winston = require("winston");

describe("log", function() {
    //system under test
    const sut = require("../../lib/log");

    it("is instance of winston.Logger", function () {
        (sut instanceof winston.Logger).should.be.true;
    });

    it("is configured to log to console", function () {
        sut.transports.console.should.exist;
    });

    it("is configured to handle exceptions", function () {
        sut.transports.console.handleExceptions.should.be.true;
    });

    it("is configured to pretty print", function () {
        sut.transports.console.prettyPrint.should.be.true;
    });

    it("is configured to colorize output", function () {
        sut.transports.console.colorize.should.be.true;
    });

    it("is configured to exclude timestamps", function () {
        sut.transports.console.timestamp.should.be.false;
    });

    it("is configured with log level info", function () {
        sut.transports.console.level.should.equal("info");
    });

    describe("increaseVerbosity()", function () {
        it("when called once should increase log level to debug", function () {
            sut.transports.console.level = "info";
            sut.increaseVerbosity();
            sut.transports.console.level.should.equal("debug");
        });

        it("when called twice should increase log level to verbose", function () {
            sut.transports.console.level = "info";
            sut.increaseVerbosity();
            sut.increaseVerbosity();
            sut.transports.console.level.should.equal("verbose");
        });
    });
});
