"use strict";

/*global describe, it*/

describe("log", function() {
    //system under test
    const sut = require("../../lib/log");

    it("is configured with log level info", function () {
        sut.level.should.equal("info");
    });

    describe("increaseVerbosity()", function () {
        it("when called once should increase log level from info to verbose", function () {
            sut.level = "info";
            sut.increaseVerbosity();
            sut.level.should.equal("verbose");
        });

        it("when called twice should increase log level from info to debug", function () {
            sut.level = "info";
            sut.increaseVerbosity();
            sut.increaseVerbosity();
            sut.level.should.equal("debug");
        });

        it("does not increase log level beyond debug", function () {
            sut.level = "debug";
            sut.increaseVerbosity();
            sut.level.should.equal("debug");
        });
    });

    describe("setLevel(level)", function () {
        it("should update level to given value", function () {
            sut.level = "info";
            sut.setLevel("warn");
            sut.level.should.equal("warn");
        });
    });
});
