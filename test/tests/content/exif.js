"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

describe("content/exif.js", function() {
    //system under test
    const sut = require("../../../lib/content/exif");

    const exif = require("exif-parser");
    const fs = require("fs");
    const log = require("../../../lib/log");

    const sandbox = sinon.sandbox.create();

    //stubs
    let createExif;
    let logDebug;
    let logError;
    let openAsync;
    let parseExif;
    let readAsync;

    beforeEach(function () {
        createExif = sandbox.stub(exif, "create");
        logDebug = sandbox.stub(log, "debug");
        logError = sandbox.stub(log, "error");
        openAsync = sandbox.stub(fs, "openAsync");
        parseExif = sandbox.stub();
        readAsync = sandbox.stub(fs, "readAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("readExif(filename)", function () {
        it("should open file for reading", function () {
            const filename = "image.jpg";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            return sut.readExif(filename).then(() => {
                openAsync.should.be.calledWith(filename, "r");
            });
        });

        it("should throw and log an error if file cannot be opened", function () {
            const filename = "image.jpg";
            const error = "error";

            openAsync.returns(Promise.resolve().throw(new Error(error)));

            return sut.readExif(filename).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Could not read file %s, %s", filename, error);
            });
        });

        it("should read first 65635 bytes of file", function () {
            const fd = "fd";
            const bytes = 65635;

            openAsync.returns(Promise.resolve(fd));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            return sut.readExif("").then(() => {
                readAsync.should.be.calledWithMatch(sinon.match(fd),
                                                    sinon.match.instanceOf(Buffer)
                                                        .and(sinon.match.has("length", bytes)),
                                                    sinon.match(0),
                                                    sinon.match(bytes),
                                                    sinon.match(0));
            });
        });

        it("should throw and log an error if file cannot be read", function () {
            const filename = "image.jpg";
            const error = "error";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve().throw(new Error(error)));

            return sut.readExif(filename).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Could not read file %s, %s", filename, error);
            });
        });

        it("should create exif parser", function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve());
            createExif.returns({ parse: parseExif });
            parseExif.returns({});

            return sut.readExif("").then(() => {
                createExif.should.be.calledWithMatch(sinon.match.instanceOf(Buffer));
            });
        });

        it("should return an empty object if exif parser cannot be created", function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.throws(new Error());

            return sut.readExif("").then(result => {
                result.should.eql({});
            });
        });

        it("should log a debug message if exif parser cannot be created", function () {
            const filename = "image.jpg";
            const error = "error";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.throws(new Error(error));

            return sut.readExif(filename).then(() => {
                logDebug.should.have.been.calledWith("No exif read from file %s, %s", filename, error);
            });
        });

        it("should parse exif", function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            return sut.readExif("").then(() => {
                parseExif.should.be.called;
            });
        });

        it("should return an empty object if file contents cannot be parsed", function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.throws(new Error());

            return sut.readExif("").then(result => {
                result.should.eql({});
            });
        });

        it("should log a debug message if file contents cannot be parsed", function () {
            const filename = "image.jpg";
            const error = "error";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.throws(new Error(error));

            return sut.readExif(filename).then(() => {
                logDebug.should.have.been.calledWith("No exif read from file %s, %s", filename, error);
            });
        });

        it("should return tags property from parsed exif", function () {
            const tags = { name: "Image" };

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: tags });

            return sut.readExif("").then(result => {
                result.should.equal(tags);
            });
        });
    });
});
