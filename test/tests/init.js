"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const util = require("util");

describe("init", function() {
    //system under test
    const sut = require("../../lib/init");

    const fs = require("fs").promises;
    const log = require("../../lib/log");
    const yaml = require("js-yaml");

    const sandbox = sinon.createSandbox();

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
        mkDir = sandbox.stub(fs, "mkdir");
        readDir = sandbox.stub(fs, "readdir");
        safeDump = sandbox.stub(yaml, "safeDump");
        writeFile = sandbox.stub(fs, "writeFile");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("init()", function () {
        it("should work upon current working directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            readDir.should.have.been.calledWith(process.cwd());
        });

        it("should log an error if current working directory cannot be read", async function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve().throw(error));

            await sut.init();

            logError.should.have.been.calledWith(util.format("Could not read current working directory; %s", error.message));
        });

        it("should log an error if target is non-empty", async function () {
            readDir.returns(Promise.resolve(["a file"]));

            await sut.init();

            logError.should.have.been.calledWith("Current working directory is not empty");
        });

        it("should not modify non-empty target", async function () {
            readDir.returns(Promise.resolve(["a file"]));

            await sut.init();

            mkDir.should.not.have.been.called;
            writeFile.should.not.have.been.called;
        });

        it("should log an info message for creation of content directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            logInfo.should.have.been.calledWith("Creating directory %s", "content");
        });

        it("should create content directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            mkDir.should.have.been.calledWith("content", 0o755);
        });

        it("should log an info message for creation of content directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            logInfo.should.have.been.calledWith("Creating directory %s", "content");
        });

        it("should log an error if content directory cannot be created", async function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.withArgs("content", 0o755).returns(Promise.resolve().throw(error));
            mkDir.returns(Promise.resolve());

            await sut.init();

            logError.should.have.been.calledWith(util.format("Could not create directory ./%s; %s", "content", error.message));
        });

        it("should create plugins directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            mkDir.should.have.been.calledWith("plugins", 0o755);
        });

        it("should log an info message for creation of plugins directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            logInfo.should.have.been.calledWith("Creating directory %s", "plugins");
        });

        it("should log an error if plugins directory cannot be created", async function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.withArgs("plugins", 0o755).returns(Promise.resolve().throw(error));
            mkDir.returns(Promise.resolve());

            await sut.init();

            logError.should.have.been.calledWith(util.format("Could not create directory ./%s; %s", "plugins", error.message));
        });

        it("should create target directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            mkDir.should.have.been.calledWith("target", 0o755);
        });

        it("should log an info message for creation of target directory", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            logInfo.should.have.been.calledWith("Creating directory %s", "target");
        });

        it("should log an error if target directory cannot be created", async function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.withArgs("target", 0o755).returns(Promise.resolve().throw(error));
            mkDir.returns(Promise.resolve());

            await sut.init();

            logError.should.have.been.calledWith(util.format("Could not create directory ./%s; %s", "target", error.message));
        });

        it("should generate yaml config", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            safeDump.should.have.been.calledWith(sinon.match({
                contentDirectory: "./content",
                pluginDirectory: "./plugins",
                targetDirectory: "./target",
                plugins: []
            }));
        });

        it("should write config to lerret.yaml", async function () {
            const config = "config";

            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            safeDump.returns(config);
            writeFile.returns(Promise.resolve());

            await sut.init();

            writeFile.should.have.been.calledWith("lerret.yaml", config, sinon.match({ mode: 0o644 }));
        });

        it("should log an info message for creation of lerret.yaml", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            logInfo.should.have.been.calledWith("Creating file lerret.yaml");
        });

        it("should log an error if config cannot be written", async function () {
            const error = new Error("error");

            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve().throw(error));

            await sut.init();

            logError.should.have.been.calledWith(util.format("Could not create lerret.yaml; %s", error.message));
        });

        it("should log an info message on success", async function () {
            readDir.returns(Promise.resolve([]));
            mkDir.returns(Promise.resolve());
            writeFile.returns(Promise.resolve());

            await sut.init();

            logInfo.should.have.been.calledWith("You're good to go!");
        });
    });
});
