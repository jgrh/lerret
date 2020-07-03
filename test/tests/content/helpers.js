"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const util = require("util");

const LerretError = require("../../../lib/errors").LerretError;

describe("content/helpers.js", function() {
    //system under test
    const sut = require("../../../lib/content/helpers");

    const fs = require("fs").promises;
    const yaml = require("js-yaml");

    const sandbox = sinon.createSandbox();

    //stubs
    let readDir;
    let readFile;
    let safeLoad;
    let stat;

    beforeEach(function() {
        readDir = sandbox.stub(fs, "readdir");
        readFile = sandbox.stub(fs, "readFile");
        safeLoad = sandbox.stub(yaml, "safeLoad");
        stat = sandbox.stub(fs, "stat");
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("listSubdirectories(directory)", function() {
        it("should return list of directories", async function() {
            const directory = "./";
            const subdirectories = ["a", "b", "c"];

            readDir.withArgs(directory).returns(Promise.resolve(subdirectories));
            stat.returns(Promise.resolve({
                isDirectory: () => true
            }));

            const result = await sut.listSubdirectories(directory);

            result.length.should.equal(subdirectories.length);
        });

        it("should throw a LerretError if directory cannot be read", function() {
            const directory = "./";
            const error = new Error("error");

            readDir.returns(Promise.resolve().throw(error));

            return sut.listSubdirectories(directory).should.be.rejectedWith(LerretError, util.format("Error reading directory %s; %s", directory, error.message));
        });

        it("should prefix subdirectory name with parent directory name", async function() {
            const directory = "./";
            const subdirectory = "a";

            readDir.returns(Promise.resolve(["a"]));
            stat.returns(Promise.resolve({
                isDirectory: () => true
            }));

            const result = await sut.listSubdirectories(directory);

            result[0].should.equal(path.join(directory, subdirectory));
        });

        it("should not return hidden subdirectories", async function() {
            readDir.returns(Promise.resolve([".a"]));
            stat.returns(Promise.resolve({
                isDirectory: () => true
            }));

            const result = await sut.listSubdirectories("");

            result.length.should.equal(0);
        });

        it("should not return subdirectory on EACCES error", async function() {
            const error = new Error();
            error.code = "EACCES";

            readDir.returns(Promise.resolve(["a"]));
            stat.returns(Promise.resolve().throw(error));

            const result = await sut.listSubdirectories("");

            result.length.should.equal(0);
        });

        it("should not return subdirectory on EPERM error", async function() {
            const error = new Error();
            error.code = "EPERM";

            readDir.returns(Promise.resolve(["a"]));
            stat.returns(Promise.resolve().throw(error));

            const result = await sut.listSubdirectories("");

            result.length.should.equal(0);
        });

        it("should not return files", async function() {
            readDir.returns(Promise.resolve(["a"]));
            stat.returns(Promise.resolve({
                isDirectory: () => false
            }));

            const result = await sut.listSubdirectories("");

            result.length.should.equal(0);
        });
    });

    describe("readYaml(filename)", function() {
        it("should read supplied filename", async function() {
            const filename = "./path/to/file";

            readFile.returns(Promise.resolve());

            await sut.readYaml(filename);

            readFile.should.be.calledWith(filename);
        });

        it("should throw a LerretError if file cannot be read", function() {
            const error = new Error("error");
            const filename = "./path/to/file";

            readFile.returns(Promise.resolve().throw(error));

            return sut.readYaml(filename).should.be.rejectedWith(LerretError, util.format("Error reading YAML file %s; %s", filename, error.message));
        });

        it("should load yaml from file", async function() {
            const file = "file";

            readFile.returns(Promise.resolve(file));

            await sut.readYaml("");

            safeLoad.should.be.calledWith(file);
        });

        it("should throw a LerretError if file cannot be parsed", function() {
            const error = new Error("error");
            const filename = "./path/to/file";

            readFile.returns(Promise.resolve());
            safeLoad.throws(error);

            return sut.readYaml(filename).should.be.rejectedWith(LerretError, util.format("Error reading YAML file %s; %s", filename, error.message));
        });

        it("should return yaml", async function() {
            const yaml = {
                key: "value"
            };

            readFile.returns(Promise.resolve());
            safeLoad.returns(yaml);

            const result = await sut.readYaml("");

            result.should.eql(yaml);
        });

        it("should return empty object if yaml is null", async function() {
            readFile.returns(Promise.resolve());
            safeLoad.returns(null);

            const result = await sut.readYaml("");

            result.should.be.empty;
        });

        it("should return empty object if file not found", async function() {
            const error = new Error();
            error.code = "ENOENT";

            readFile.returns(Promise.resolve().throw(error));

            const result = await sut.readYaml("");

            result.should.be.empty;
        });
    });
});
