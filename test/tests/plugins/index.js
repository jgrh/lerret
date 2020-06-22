"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

const path = require("path");
const util = require("util");

const LerretError = require("../../../lib/errors").LerretError;

describe("plugins/index.js", function() {
    //system under test
    const sut = require("../../../lib/plugins");

    const config = require("../../../lib/config");
    const fs = require("fs").promises;
    const log = require("../../../lib/log");
    const module = require("module");
    const plugins = require("../../../lib/plugins/plugins");

    const convert = require("../../../lib/plugins/convert");
    const copy = require("../../../lib/plugins/copy");
    const pug = require("../../../lib/plugins/pug");

    const sandbox = sinon.createSandbox();

    //stubs
    let getConfig;
    let getPluginSequence;
    let installPlugin;
    let logVerbose;
    let readDir;
    let requireModule;
    let stat;

    beforeEach(function () {
        getConfig = sandbox.stub(config, "get");
        getPluginSequence = sandbox.stub(plugins, "getPluginSequence");
        installPlugin = sandbox.stub(plugins, "installPlugin");
        logVerbose = sandbox.stub(log, "verbose");
        readDir = sandbox.stub(fs, "readdir");
        requireModule = sandbox.stub(module, "_load");
        stat = sandbox.stub(fs, "stat");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("initPlugins()", function () {
        it("should log a verbose message for installation of built-in plugins", async function () {
            readDir.returns(Promise.resolve([]));

            await sut.initPlugins();

            logVerbose.should.have.been.calledWith("Loading built-in plugins");
        });

        it("should install built-in plugin convert", async function () {
            readDir.returns(Promise.resolve([]));

            await sut.initPlugins();

            installPlugin.should.have.been.calledWith(convert);
        });

        it("should install built-in plugin copy", async function () {
            readDir.returns(Promise.resolve([]));

            await sut.initPlugins();

            installPlugin.should.have.been.calledWith(copy);
        });

        it("should install built-in plugin pug", async function () {
            readDir.returns(Promise.resolve([]));

            await sut.initPlugins();

            installPlugin.should.have.been.calledWith(pug);
        });

        it("should log a verbose message for installation of project plugins", async function () {
            readDir.returns(Promise.resolve([]));

            await sut.initPlugins();

            logVerbose.should.have.been.calledWith("Loading project plugins");
        });

        it("should read additional plugins from configured plugin directory", async function () {
            const pluginDirectory = "./plugins";

            getConfig.withArgs("pluginDirectory").returns(pluginDirectory);
            readDir.returns(Promise.resolve([]));

            await sut.initPlugins();

            readDir.should.have.been.calledWith(pluginDirectory);
        });

        it("should handle multiple additional plugins", async function () {
            const pluginFilenames = ["plugin1.js", "plugin2.js", "plugin3.js"];

            getConfig.returns("");
            readDir.returns(Promise.resolve(pluginFilenames));
            stat.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.returns({});

            await sut.initPlugins();

            requireModule.should.have.callCount(pluginFilenames.length);
        });

        it("should ignore files without the .js extension", async function () {
            const pluginFilename = "plugin";

            getConfig.returns("");
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => false }));

            await sut.initPlugins();

            requireModule.should.not.have.been.called;
        });

        it("should ignore hidden files", async function () {
            const pluginFilename = ".plugin.js";

            getConfig.returns("");
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => false }));

            await sut.initPlugins();

            requireModule.should.not.have.been.called;
        });

        it("should handle subdirectories as plugins", async function () {
            const pluginFilename = "plugin";

            getConfig.returns("");
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => true }));
            requireModule.returns({});

            await sut.initPlugins();

            requireModule.should.have.been.calledWithMatch(sinon.match(pluginFilename));
        });

        it("should ignore hidden directories", async function () {
            const pluginFilename = ".plugin";

            getConfig.returns("");
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => true }));

            await sut.initPlugins();

            requireModule.should.not.have.been.called;
        });

        it("should load project plugin using its absolute path", async function () {
            const pluginDirectory = "./plugins";
            const pluginFilename = "plugin.js";

            getConfig.returns(pluginDirectory);
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.returns({});

            await sut.initPlugins();

            requireModule.should.have.been.calledWith(path.resolve(pluginDirectory, pluginFilename));
        });

        it("should throw a LerretError if project plugin cannot be loaded", function() {
            const error = new Error("error");
            const pluginFilename = "plugin.js";

            getConfig.returns("");
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.throws(error);

            return sut.initPlugins().should.be.rejectedWith(LerretError, util.format("Cannot load module %s; $s", path.resolve(pluginFilename), error.message));
        });

        it("should install project plugin after loading it", async function () {
            const pluginDirectory = "./plugins";
            const pluginFilename = "plugin.js";
            const pluginModule = { name: "plugin" };

            getConfig.returns(pluginDirectory);
            readDir.returns(Promise.resolve([pluginFilename]));
            stat.returns(Promise.resolve({ isDirectory: () => false }));
            requireModule.returns(pluginModule);

            await sut.initPlugins();

            installPlugin.should.have.been.calledWith(pluginModule);
        });

        it("should allow plugin directory to be non-existent", async function () {
            const error = new Error();
            error.code = "ENOENT";

            readDir.returns(Promise.resolve().throw(error));

            const result = await sut.initPlugins();

            assert(result === undefined);
        });
    });

    describe("callPlugins(content)", function () {
        it("should generate plugin sequence with configured plugins", async function () {
            const pluginList = ["plugin1", "plugin2"];

            getConfig.withArgs("plugins").returns(pluginList);
            getPluginSequence.returns(() => Promise.resolve());

            await sut.callPlugins("");

            getPluginSequence.should.be.calledWith(pluginList);
        });

        it("should execute plugin sequence on content", async function () {
            const content = "content";
            const pluginSequence = sandbox.stub();

            getPluginSequence.returns(pluginSequence);
            pluginSequence.returns(Promise.resolve());

            await sut.callPlugins(content);

            pluginSequence.should.have.been.calledWith(content);
        });

        it("should return result of executing plugin sequence", async function () {
            const content = "content";
            const pluginSequence = sandbox.stub();

            getPluginSequence.returns(pluginSequence);
            pluginSequence.returns(Promise.resolve(content));

            const result = await sut.callPlugins("");

            result.should.equal(content);
        });
    });
});
