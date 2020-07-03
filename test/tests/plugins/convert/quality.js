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

    const conversion = 0;

    beforeEach(function() {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        quality = sandbox.stub();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("isConfigured(conversion)", function() {
        it("should return true if quality configuration entry exists", function() {
            hasConfig.withArgs("convert[" + conversion + "].quality").returns(true);

            sut.isConfigured(conversion).should.be.true;
        });

        it("should return false if quality configuration entry does not exist", function() {
            hasConfig.withArgs("convert[" + conversion + "].quality").returns(false);

            sut.isConfigured(conversion).should.be.false;
        });
    });

    describe("apply(conversion, input)", function() {
        it("should adjust image quality to configured value", function() {
            const qual = 80;

            getConfig.withArgs("convert[" + conversion + "].quality").returns(qual);

            sut.apply(conversion, {
                quality: quality
            });

            quality.should.have.been.calledWith(qual);
        });

        it("should return result of adjusting quality", function() {
            const output = "output";

            quality.returns(output);

            sut.apply(conversion, {
                quality: quality
            }).should.equal(output);
        });
    });
});
