"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");

describe("content/helpers.js", function() {
    //system under test
    const sut = require("../../../lib/content/helpers");

    const fs = require("fs");
    const log = require("../../../lib/log");
    const yaml = require("js-yaml");

    const sandbox = sinon.sandbox.create();

    //stubs
    let logError;
    let readDirAsync;
    let readFileAsync;
    let safeLoad;
    let statAsync;

    beforeEach(function () {
        logError = sandbox.stub(log, "error");
        readDirAsync = sandbox.stub(fs, "readdirAsync");
        readFileAsync = sandbox.stub(fs, "readFileAsync");
        safeLoad = sandbox.stub(yaml, "safeLoad");
        statAsync = sandbox.stub(fs, "statAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("listSubdirectories(directory)", function() {
        it("should return list of directories", function () {
            const directory = "./";
            const subdirectories = ["a", "b", "c"];

            readDirAsync.withArgs(directory).returns(Promise.resolve(subdirectories));
            statAsync.returns(Promise.resolve({ isDirectory: () => true }));

            return sut.listSubdirectories(directory).then(result => {
                result.length.should.equal(subdirectories.length);
            });
        });

        it("should throw and log an error if directory cannot be read", function () {
            const directory = "./";
            const error = "error";

            readDirAsync.returns(Promise.resolve().throw(new Error(error)));

            return sut.listSubdirectories(directory).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Error reading directory %s, %s", directory, error);
            });
        });

        it("should prefix subdirectory name with parent directory name", function () {
            const directory = "./";
            const subdirectory = "a";

            readDirAsync.returns(Promise.resolve(["a"]));
            statAsync.returns(Promise.resolve({ isDirectory: () => true }));

            return sut.listSubdirectories(directory).then(result => {
                result[0].should.equal(path.join(directory, subdirectory));
            });
        });

        it("should not return hidden subdirectories", function () {
            readDirAsync.returns(Promise.resolve([".a"]));
            statAsync.returns(Promise.resolve({ isDirectory: () => true }));

            return sut.listSubdirectories("").then(result => {
                result.length.should.equal(0);
            });
        });

        it("should not return subdirectory on EACCES error", function () {
            const error = new Error();
            error.code = "EACCES";

            readDirAsync.returns(Promise.resolve(["a"]));
            statAsync.returns(Promise.resolve().throw(error));

            return sut.listSubdirectories("").then(result => {
                result.length.should.equal(0);
            });
        });

        it("should not return subdirectory on EPERM error", function () {
            const error = new Error();
            error.code = "EPERM";

            readDirAsync.returns(Promise.resolve(["a"]));
            statAsync.returns(Promise.resolve().throw(error));

            return sut.listSubdirectories("").then(result => {
                result.length.should.equal(0);
            });
        });

        it("should not return files", function () {
            readDirAsync.returns(Promise.resolve(["a"]));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));

            return sut.listSubdirectories("").then(result => {
                result.length.should.equal(0);
            });
        });
    });

    describe("readYaml(filename)", function() {
        it("should read supplied filename", function () {
            const filename = "./path/to/file";

            readFileAsync.returns(Promise.resolve());

            return sut.readYaml(filename).then(() => {
                readFileAsync.should.be.calledWith(filename);
            });
        });

        it("should throw and log an error if file cannot be read", function () {
            const filename = "./path/to/file";
            const error = "error";

            readFileAsync.returns(Promise.resolve().throw(new Error(error)));

            return sut.readYaml(filename).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Error reading YAML file %s, %s", filename, error);
            });
        });

        it("should load yaml from file", function () {
            const file = "file";

            readFileAsync.returns(Promise.resolve(file));

            return sut.readYaml("").then(() => {
                safeLoad.should.be.calledWith(file);
            });
        });

        it("should throw and log an error if file cannot be parsed", function () {
            const filename = "./path/to/file";
            const error = "error";

            readFileAsync.returns(Promise.resolve());
            safeLoad.throws(new Error(error));

            return sut.readYaml(filename).should.be.rejectedWith(Error).then(() => {
                logError.should.have.been.calledWith("Error reading YAML file %s, %s", filename, error);
            });
        });

        it("should return yaml", function () {
            const yaml = { key: "value" };

            readFileAsync.returns(Promise.resolve());
            safeLoad.returns(yaml);

            return sut.readYaml("").then(result => {
                result.should.eql(yaml);
            });
        });

        it("should return empty object if yaml is null", function () {
            readFileAsync.returns(Promise.resolve());
            safeLoad.returns(null);

            return sut.readYaml("").then(result => {
                result.should.be.empty;
            });
        });

        it("should return empty object if file not found", function () {
            const error = new Error();
            error.code = "ENOENT";

            readFileAsync.returns(Promise.resolve().throw(error));

            return sut.readYaml("").then(result => {
                result.should.be.empty;
            });
        });
    });
});
