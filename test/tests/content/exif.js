"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const util = require("util");

const LerretError = require("../../../lib/errors").LerretError;

describe("content/exif.js", function() {
    //system under test
    const sut = require("../../../lib/content/exif");

    const exif = require("exif-parser");
    const fs = require("fs");
    const log = require("../../../lib/log");

    const sandbox = sinon.createSandbox();

    //stubs
    let createExif;
    let logVerbose;
    let openAsync;
    let parseExif;
    let readAsync;

    beforeEach(function () {
        createExif = sandbox.stub(exif, "create");
        logVerbose = sandbox.stub(log, "verbose");
        openAsync = sandbox.stub(fs, "openAsync");
        parseExif = sandbox.stub();
        readAsync = sandbox.stub(fs, "readAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("readExif(filename)", function () {
        it("should open file for reading", async function () {
            const filename = "image.jpg";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif(filename);

            openAsync.should.be.calledWith(filename, "r");
        });

        it("should throw a LerretError if file cannot be opened", function () {
            const error = new Error("error");
            const filename = "image.jpg";

            openAsync.returns(Promise.resolve().throw(error));

            return sut.readExif(filename).should.be.rejectedWith(LerretError, util.format("Could not read file %s; %s", filename, error.message));
        });

        it("should read first 65635 bytes of file", async function () {
            const fd = "fd";
            const bytes = 65635;

            openAsync.returns(Promise.resolve(fd));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif("");

            readAsync.should.be.calledWithMatch(sinon.match(fd),
                                                sinon.match.instanceOf(Buffer)
                                                    .and(sinon.match.has("length", bytes)),
                                                sinon.match(0),
                                                sinon.match(bytes),
                                                sinon.match(0));
        });

        it("should throw a LerretError if file cannot be read", function () {
            const error = new Error("error");
            const filename = "image.jpg";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve().throw(error));

            return sut.readExif(filename).should.be.rejectedWith(LerretError, util.format("Could not read file %s; %s", filename, error.message));
        });

        it("should create exif parser", async function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve());
            createExif.returns({ parse: parseExif });
            parseExif.returns({});

            await sut.readExif("");

            createExif.should.be.calledWithMatch(sinon.match.instanceOf(Buffer));
        });

        it("should return an empty object if exif parser cannot be created", async function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.throws(new Error());

            const result = await sut.readExif("");

            result.should.eql({});
        });

        it("should log a verbose message if exif parser cannot be created", async function () {
            const error = new Error("error");
            const filename = "image.jpg";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.throws(error);

            await sut.readExif(filename);

            logVerbose.should.have.been.calledWith("No exif read from file %s; %s", filename, error.message);
        });

        it("should parse exif", async function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif("");

            parseExif.should.be.called;
        });

        it("should return an empty object if file contents cannot be parsed", async function () {
            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.throws(new Error());

            const result = await sut.readExif("");

            result.should.eql({});
        });

        it("should log a verbose message if file contents cannot be parsed", async function () {
            const error = new Error("error");
            const filename = "image.jpg";

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.throws(error);

            await sut.readExif(filename);

            logVerbose.should.have.been.calledWith("No exif read from file %s; %s", filename, error.message);
        });

        it("should return tags property from parsed exif", async function () {
            const tags = { name: "Image" };

            openAsync.returns(Promise.resolve(""));
            readAsync.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: tags });

            const result = await sut.readExif("");

            result.should.equal(tags);
        });
    });
});
