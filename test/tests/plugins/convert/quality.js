"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

describe("plugins/convert/quality.js", function() {
    //system under test
    const sut = require("../../../../lib/plugins/convert/quality");

    const config = require("../../../../lib/config");

    const sandbox = sinon.createSandbox();

    //stubs
    let getConfig;
    let hasConfig;
    let quality;

    const prefix = "prefix";

    beforeEach(function() {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        quality = sandbox.stub();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("isConfigured(prefix)", function() {
        it("should return true if quality configuration entry exists", function() {
            hasConfig.withArgs(prefix + "quality").returns(true);

            sut.isConfigured(prefix).should.be.true;
        });

        it("should return false if quality configuration entry does not exist", function() {
            hasConfig.withArgs(prefix + "quality").returns(false);

            sut.isConfigured(prefix).should.be.false;
        });
    });

    describe("apply(prefix, input)", function() {
        it("should adjust image quality to configured value", function() {
            const qual = 80;

            getConfig.withArgs(prefix + "quality").returns(qual);

            sut.apply(prefix, {
                quality: quality
            });

            quality.should.have.been.calledWith(qual);
        });

        it("should return result of adjusting quality", function() {
            const output = "output";

            quality.returns(output);

            sut.apply(prefix, {
                quality: quality
            }).should.equal(output);
        });
    });
});
