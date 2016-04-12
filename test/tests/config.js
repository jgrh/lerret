"use strict";

/*global after, afterEach, beforeEach, describe, it, sinon*/

const path = require("path");
const util = require("util");

const LerretError = require("../../lib/errors").LerretError;

describe("config", function() {
    //system under test
    let sut;

    const fs = require("fs");
    const yaml = require("js-yaml");

    const sandbox = sinon.sandbox.create();

    //stubs
    let readFileSync;
    let safeLoad;

    function invalidateCacheOfConfigModule() {
        delete require.cache[require.resolve("../../lib/config")];
    }

    beforeEach(function () {
        invalidateCacheOfConfigModule();
        sut = require("../../lib/config");

        readFileSync = sandbox.stub(fs, "readFileSync");
        safeLoad = sandbox.stub(yaml, "safeLoad");
    });

    afterEach(function () {
        sandbox.restore();
    });

    after(function () {
        invalidateCacheOfConfigModule();
    });

    describe("has(key)", function () {
        it("should load lerret.yaml from current working directory", function () {
            const filename = path.join(process.cwd(), "lerret.yaml");

            sut.has("key");

            readFileSync.should.have.been.calledWith(filename);
        });

        it("should parse config file as yaml", function () {
            const yaml = "yaml";

            readFileSync.returns(yaml);

            sut.has("key");

            safeLoad.should.have.been.calledWith(yaml);
        });

        it("should load config file only once", function () {
            readFileSync.returns("");
            safeLoad.returns({});

            sut.has("key");
            sut.has("another_key");

            readFileSync.should.have.been.calledOnce;
            safeLoad.should.have.been.calledOnce;
        });

        it("should throw a LerretError if config file does not exist", function () {
            const error = new Error("error");

            readFileSync.throws(error);

            (() => sut.get("has")).should.throw(LerretError, util.format("Unable to load ./lerret.yaml; %s", error.message));
        });

        it("should return true if key exists", function () {
            safeLoad.returns({ key: "value" });

            sut.has("key").should.be.true;
        });

        it("should return false if key doesn't exist", function () {
            safeLoad.returns({});

            sut.has("key").should.be.false;
        });

        it("should allow path-style keys", function () {
            safeLoad.returns({ foo: { bar: "value" }});

            sut.has("foo.bar").should.be.true;
        });
    });

    describe("get(key, default)", function () {
        it("should load lerret.yaml from current working directory", function () {
            const filename = path.join(process.cwd(), "lerret.yaml");

            sut.get("key", "value");

            readFileSync.should.have.been.calledWith(filename);
        });

        it("should parse config file as yaml", function () {
            const yaml = "yaml";

            readFileSync.returns(yaml);

            sut.get("key", "value");

            safeLoad.should.have.been.calledWith(yaml);
        });

        it("should load config file only once", function () {
            readFileSync.returns("");
            safeLoad.returns({});

            sut.get("key", "value");
            sut.get("another_key", "value");

            readFileSync.should.have.been.calledOnce;
            safeLoad.should.have.been.calledOnce;
        });

        it("should throw a LerretError if config file does not exist", function () {
            const error = new Error("error");

            readFileSync.throws(error);

            (() => sut.get("key", "default")).should.throw(LerretError, util.format("Unable to load ./lerret.yaml; %s", error.message));
        });

        it("should return value for key if key exists", function () {
            const value = "value";

            safeLoad.returns({ key: value });

            sut.get("key").should.equal(value);
        });

        it("should throw a LerretError if key doesn't exist and no default provided", function () {
            const key = "kwy";

            safeLoad.returns({});

            (() => sut.get(key)).should.throw(LerretError, util.format("Configuration parameter %s does not exist", key));
        });

        it("should return default if key doesn't exist", function () {
            const value = "value";

            safeLoad.returns({});

            sut.get("key", value).should.equal(value);
        });

        it("shoud allow path-style keys", function () {
            const value = "value";

            safeLoad.returns({ foo: { bar: value }});

            sut.get("foo.bar").should.equal(value);
        });
    });

    describe("defaults", function () {
        it("contentDirectory has a default value of ./content", function () {
            safeLoad.returns({});

            sut.get("contentDirectory").should.equal("./content");
        });

        it("contentDirectory default can be overridden", function () {
            const value = "value";

            safeLoad.returns({ contentDirectory: value });

            sut.get("contentDirectory").should.equal(value);
        });

        it("pluginDirectory has a default value of ./plugins", function () {
            safeLoad.returns({});

            sut.get("pluginDirectory").should.equal("./plugins");
        });

        it("pluginDirectory default can be overridden", function () {
            const value = "value";

            safeLoad.returns({ pluginDirectory: value });

            sut.get("pluginDirectory").should.equal(value);
        });
    });
});
