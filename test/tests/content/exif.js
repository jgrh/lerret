"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const util = require("util");

const LerretError = require("../../../lib/errors").LerretError;

describe("content/exif.js", function() {
    //system under test
    const sut = require("../../../lib/content/exif");

    const exif = require("exif-parser");
    const fs = require("fs").promises;
    const log = require("../../../lib/log");

    const sandbox = sinon.createSandbox();

    //stubs
    let createExif;
    let logVerbose;
    let open;
    let parseExif;
    let read;
    let close;

    beforeEach(function () {
        createExif = sandbox.stub(exif, "create");
        logVerbose = sandbox.stub(log, "verbose");
        open = sandbox.stub(fs, "open");
        parseExif = sandbox.stub();
        read = sandbox.stub();
        close = sandbox.stub();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("readExif(filename)", function () {
        it("should open file for reading", async function () {
            const filename = "image.jpg";

            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif(filename);

            open.should.be.calledWith(filename, "r");
        });

        it("should throw a LerretError if file cannot be opened", function () {
            const error = new Error("error");
            const filename = "image.jpg";

            open.returns(Promise.resolve().throw(error));

            return sut.readExif(filename).should.be.rejectedWith(LerretError, util.format("Could not read file %s; %s", filename, error.message));
        });

        it("should read first 65635 bytes of file", async function () {
            const bytes = 65635;

            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif("");

            read.should.be.calledWithMatch(sinon.match.instanceOf(Buffer)
                                                .and(sinon.match.has("length", bytes)),
                                            sinon.match(0),
                                            sinon.match(bytes),
                                            sinon.match(0));
        });

        it("should throw a LerretError if file cannot be read", function () {
            const error = new Error("error");
            const filename = "image.jpg";

            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve().throw(error));

            return sut.readExif(filename).should.be.rejectedWith(LerretError, util.format("Could not read file %s; %s", filename, error.message));
        });

        it("should close file", async function () {
            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif("");

            close.should.be.called;
        });

        it("should still close file if an error is thrown when reading the file", async function () {
            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve().throw(new Error("error")));

            try {
                await sut.readExif("");
            }
            catch (e) {
                //expected
            }

            close.should.be.called;
        });

        it("should create exif parser", async function () {
            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve());
            createExif.returns({ parse: parseExif });
            parseExif.returns({});

            await sut.readExif("");

            createExif.should.be.calledWithMatch(sinon.match.instanceOf(Buffer));
        });

        it("should return an empty object if exif parser cannot be created", async function () {
            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.throws(new Error());

            const result = await sut.readExif("");

            result.should.eql({});
        });

        it("should log a verbose message if exif parser cannot be created", async function () {
            const error = new Error("error");
            const filename = "image.jpg";

            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.throws(error);

            await sut.readExif(filename);

            logVerbose.should.have.been.calledWith("No exif read from file %s; %s", filename, error.message);
        });

        it("should parse exif", async function () {
            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: "" });

            await sut.readExif("");

            parseExif.should.be.called;
        });

        it("should return an empty object if file contents cannot be parsed", async function () {
            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.throws(new Error());

            const result = await sut.readExif("");

            result.should.eql({});
        });

        it("should log a verbose message if file contents cannot be parsed", async function () {
            const error = new Error("error");
            const filename = "image.jpg";

            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.throws(error);

            await sut.readExif(filename);

            logVerbose.should.have.been.calledWith("No exif read from file %s; %s", filename, error.message);
        });

        it("should return tags property from parsed exif", async function () {
            const tags = { name: "Image" };

            open.returns(Promise.resolve({ read: read,  close: close }));
            read.returns(Promise.resolve([0, 0]));
            createExif.returns({ parse: parseExif });
            parseExif.returns({ tags: tags });

            const result = await sut.readExif("");

            result.should.equal(tags);
        });
    });
});
