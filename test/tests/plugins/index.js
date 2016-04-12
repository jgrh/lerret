"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const path = require("path");
const util = require("util");

const LerretError = require("../../../lib/errors").LerretError;

describe("plugins/index.js", function() {
    //system under test
    const sut = require("../../../lib/plugins");

    const config = require("../../../lib/config");
    const fs = require("fs");
    const log = require("../../../lib/log");
    const module = require("module");
    const plugins = require("../../../lib/plugins/plugins");

    const copy = require("../../../lib/plugins/copy");
    const jade = require("../../../lib/plugins/jade");
    const resize = require("../../../lib/plugins/resize");

    const sandbox = sinon.sandbox.create();

    //stubs
    let getConfig;
    let getPluginSequence;
    let installPlugin;
    let logDebug;
    let readDirAsync;
    let requireModule;
    let statAsync;

    beforeEach(function () {
        getConfig = sandbox.stub(config, "get");
        getPluginSequence = sandbox.stub(plugins, "getPluginSequence");
        installPlugin = sandbox.stub(plugins, "installPlugin");
        logDebug = sandbox.stub(log, "debug");
        readDirAsync = sandbox.stub(fs, "readdirAsync");
        requireModule = sandbox.stub(module, "_load");
        statAsync = sandbox.stub(fs, "statAsync");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("initPlugins()", function () {
        it("should log a debug message for installation of built-in plugins", function () {
            readDirAsync.returns(Promise.resolve([]));

            return sut.initPlugins().then(() => {
                logDebug.should.have.been.calledWith("Loading built-in plugins.");
            });
        });

        it("should install built-in plugin copy", function () {
            readDirAsync.returns(Promise.resolve([]));

            return sut.initPlugins().then(() => {
                installPlugin.should.have.been.calledWith(copy);
            });
        });

        it("should install built-in plugin jade", function () {
            readDirAsync.returns(Promise.resolve([]));

            return sut.initPlugins().then(() => {
                installPlugin.should.have.been.calledWith(jade);
            });
        });

        it("should install built-in plugin resize", function () {
            readDirAsync.returns(Promise.resolve([]));

            return sut.initPlugins().then(() => {
                installPlugin.should.have.been.calledWith(resize);
            });
        });

        it("should log a debug message for installation of project plugins", function () {
            readDirAsync.returns(Promise.resolve([]));

            return sut.initPlugins().then(() => {
                logDebug.should.have.been.calledWith("Loading project plugins.");
            });
        });

        it("should read additional plugins from configured plugin directory", function () {
            const pluginDirectory = "./plugins";

            getConfig.withArgs("pluginDirectory").returns(pluginDirectory);
            readDirAsync.returns(Promise.resolve([]));

            return sut.initPlugins().then(() => {
                readDirAsync.should.have.been.calledWith(pluginDirectory);
            });
        });

        it("should handle multiple additional plugins", function () {
            const pluginFilenames = ["plugin1.js", "plugin2.js", "plugin3.js"];

            getConfig.returns("");
            readDirAsync.returns(Promise.resolve(pluginFilenames));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.returns({});

            return sut.initPlugins().then(() => {
                requireModule.should.have.callCount(pluginFilenames.length);
            });
        });

        it("should ignore files without the .js extension", function () {
            const pluginFilename = "plugin";

            getConfig.returns("");
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));

            return sut.initPlugins().then(() => {
                requireModule.should.not.have.been.called;
            });
        });

        it("should ignore hidden files", function () {
            const pluginFilename = ".plugin.js";

            getConfig.returns("");
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));

            return sut.initPlugins().then(() => {
                requireModule.should.not.have.been.called;
            });
        });

        it("should handle subdirectories as plugins", function () {
            const pluginFilename = "plugin";

            getConfig.returns("");
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => true }));
            requireModule.returns({});

            return sut.initPlugins().then(() => {
                requireModule.should.have.been.calledWithMatch(sinon.match(pluginFilename));
            });
        });

        it("should ignore hidden directories", function () {
            const pluginFilename = ".plugin";

            getConfig.returns("");
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => true }));

            return sut.initPlugins().then(() => {
                requireModule.should.not.have.been.called;
            });
        });

        it("should load project plugin using its absolute path", function () {
            const pluginDirectory = "./plugins";
            const pluginFilename = "plugin.js";

            getConfig.returns(pluginDirectory);
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.returns({});

            return sut.initPlugins().then(() => {
                requireModule.should.have.been.calledWith(path.resolve(pluginDirectory, pluginFilename));
            });
        });

        it("should throw a LerretError if project plugin cannot be loaded", function() {
            const error = new Error("error");
            const pluginFilename = "plugin.js";

            getConfig.returns("");
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.throws(error);

            return sut.initPlugins().should.be.rejectedWith(LerretError, util.format("Cannot load module %s; $s", path.resolve(pluginFilename), error.message));
        });

        it("should install project plugin after loading it", function () {
            const pluginDirectory = "./plugins";
            const pluginFilename = "plugin.js";
            const pluginModule = { name: "plugin" };

            getConfig.returns(pluginDirectory);
            readDirAsync.returns(Promise.resolve([pluginFilename]));
            statAsync.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.returns(pluginModule);

            return sut.initPlugins().then(() => {
                installPlugin.should.have.been.calledWith(pluginModule);
            });
        });

        it("should allow plugin directory to be non-existent", function () {
            const error = new Error();
            error.code = "ENOENT";

            readDirAsync.returns(Promise.resolve().throw(error));

            return sut.initPlugins().then(result => {
                assert(result === undefined);
            });
        });
    });

    describe("callPlugins(content)", function () {
        it("should generate plugin sequence with configured plugins", function () {
            const pluginList = ["plugin1", "plugin2"];

            getConfig.withArgs("plugins").returns(pluginList);
            getPluginSequence.returns(() => Promise.resolve());

            return sut.callPlugins("").then(() => {
                getPluginSequence.should.be.calledWith(pluginList);
            });
        });

        it("should execute plugin sequence on content", function () {
            const content = "content";
            const pluginSequence = sandbox.stub();

            getPluginSequence.returns(pluginSequence);
            pluginSequence.returns(Promise.resolve());

            return sut.callPlugins(content).then(() => {
                pluginSequence.should.have.been.calledWith(content);
            });
        });

        it("should return result of executing plugin sequence", function () {
            const content = "content";
            const pluginSequence = sandbox.stub();

            getPluginSequence.returns(pluginSequence);
            pluginSequence.returns(Promise.resolve(content));

            return sut.callPlugins("").then(result => {
                result.should.equal(content);
            });
        });
    });
});
