"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const util = require("util");

describe("init", function() {
    //system under test
    const sut = require("../../lib/init");

    const fs = require("fs");
    const log = require("../../lib/log");
    const yaml = require("js-yaml");

    const sandbox = sinon.sandbox.create();

    //stubs
    let logError;
    let logInfo;
    let mkDir;
    let readDir;
    let safeDump;
    let writeFile;

    beforeEach(function () {
        logError = sandbox.stub(log, "error");
        logInfo = sandbox.stub(log, "info");
        mkDir = sandbox.stub(fs, "mkdirAsync");
        readDir = sandbox.stub(fs, "readdirAsync");
        safeDump = sandbox.stub(yaml, "safeDump");
        writeFile = sandbox.stub(fs, "writeFileAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("init()", function () {
        it("should work upon current working directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                readDir.should.have.been.calledWith(process.cwd());
            });
        });

        it("should log an error if current working directory cannot be read", function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve().throw(error));

            return sut.init().then(() => {
                logError.should.have.been.calledWith(util.format("Could not read current working directory; %s", error.message));
            });
        });

        it("should log an error if target is non-empty", function () {
            readDir.returns(Promise.resolve(["a file"]));

            return sut.init().then(() => {
                logError.should.have.been.calledWith("Current working directory is not empty");
            });
        });

        it("should not modify non-empty target", function () {
            readDir.returns(Promise.resolve(["a file"]));

            return sut.init().then(() => {
                mkDir.should.not.have.been.called;
                writeFile.should.not.have.been.called;
            });
        });

        it("should log an info message for creation of content directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                logInfo.should.have.been.calledWith("Creating directory %s", "content");
            });
        });

        it("should create content directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                mkDir.should.have.been.calledWith("content", 0o755);
            });
        });

        it("should log an info message for creation of content directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                logInfo.should.have.been.calledWith("Creating directory %s", "content");
            });
        });

        it("should log an error if content directory cannot be created", function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.withArgs("content", 0o755).returns(Promise.resolve().throw(error));
            mkDir.returns(Promise.resolve());

            return sut.init().then(() => {
                logError.should.have.been.calledWith(util.format("Could not create directory ./%s; %s", "content", error.message));
            });
        });

        it("should create plugins directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                mkDir.should.have.been.calledWith("plugins", 0o755);
            });
        });

        it("should log an info message for creation of plugins directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                logInfo.should.have.been.calledWith("Creating directory %s", "plugins");
            });
        });

        it("should log an error if plugins directory cannot be created", function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.withArgs("plugins", 0o755).returns(Promise.resolve().throw(error));
            mkDir.returns(Promise.resolve());

            return sut.init().then(() => {
                logError.should.have.been.calledWith(util.format("Could not create directory ./%s; %s", "plugins", error.message));
            });
        });

        it("should create target directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                mkDir.should.have.been.calledWith("target", 0o755);
            });
        });

        it("should log an info message for creation of target directory", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                logInfo.should.have.been.calledWith("Creating directory %s", "target");
            });
        });

        it("should log an error if target directory cannot be created", function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.withArgs("target", 0o755).returns(Promise.resolve().throw(error));
            mkDir.returns(Promise.resolve());

            return sut.init().then(() => {
                logError.should.have.been.calledWith(util.format("Could not create directory ./%s; %s", "target", error.message));
            });
        });

        it("should generate yaml config", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                safeDump.should.have.been.calledWith(sinon.match({
                    contentDirectory: "./content",
                    pluginDirectory: "./plugins",
                    targetDirectory: "./target",
                    plugins: []
                }));
            });
        });

        it("should write config to lerret.yaml", function () {
            const config = "config";

            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            safeDump.returns(config);
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                writeFile.should.have.been.calledWith("lerret.yaml", config, sinon.match({ mode: 0o644 }));
            });
        });

        it("should log an info message for creation of lerret.yaml", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                logInfo.should.have.been.calledWith("Creating file lerret.yaml");
            });
        });

        it("should log an error if config cannot be written", function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve().throw(error));

            return sut.init().then(() => {
                logError.should.have.been.calledWith(util.format("Could not create lerret.yaml; %s", error.message));
            });
        });

        it("should log an info message on success", function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            return sut.init().then(() => {
                logInfo.should.have.been.calledWith("You're good to go!");
            });
        });
    });
});
