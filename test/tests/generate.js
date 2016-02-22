"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

describe("generate.js", function() {
    //system under test
    const sut = require("../../lib/generate");

    const content = require("../../lib/content");
    const log = require("../../lib/log");
    const plugins = require("../../lib/plugins");

    const sandbox = sinon.sandbox.create();

    //stubs
    let callPlugins;
    let initPlugins;
    let loadContent;
    let logInfo;

    beforeEach(function () {
        callPlugins = sandbox.stub(plugins, "callPlugins");
        initPlugins = sandbox.stub(plugins, "initPlugins");
        loadContent = sandbox.stub(content, "loadContent");
        logInfo = sandbox.stub(log, "info");
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("generate()", function () {
        it("should initilise plugins", function () {
            initPlugins.returns(Promise.resolve());

            return sut.generate().then(() => {
                initPlugins.should.have.been.called;
            });
        });

        it("should initilise plugins before calling them", function () {
            initPlugins.returns(Promise.resolve());

            return sut.generate().then(() => {
                sinon.assert.callOrder(initPlugins, callPlugins);
            });
        });

        it("should load content", function () {
            initPlugins.returns(Promise.resolve());

            return sut.generate().then(() => {
                loadContent.should.have.been.called;
            });
        });

        it("should run plugins on content", function () {
            const loaded = "content";

            initPlugins.returns(Promise.resolve());
            loadContent.returns(Promise.resolve(loaded));

            return sut.generate().then(() => {
                callPlugins.should.have.been.calledWith(loaded);
            });
        });

        it("should log an info message on success", function () {
            initPlugins.returns(Promise.resolve());

            return sut.generate().then(() => {
                logInfo.should.have.been.calledWith("All done :)");
            });
        });
    });
});
