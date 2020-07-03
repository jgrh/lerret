"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

describe("plugins/convert/unsharp.js", function() {
    //system under test
    const sut = require("../../../../lib/plugins/convert/unsharp");

    const config = require("../../../../lib/config");

    const sandbox = sinon.createSandbox();

    //stubs
    let getConfig;
    let hasConfig;
    let unsharp;

    const conversion = 0;

    beforeEach(function() {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        unsharp = sandbox.stub();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("isConfigured(conversion)", function() {
        it("should return true if unsharp configuration entry exists", function() {
            hasConfig.withArgs("convert[" + conversion + "].unsharp").returns(true);

            sut.isConfigured(conversion).should.be.true;
        });

        it("should return false if unsharp configuration entry does not exist", function() {
            hasConfig.withArgs("convert[" + conversion + "].unsharp").returns(false);

            sut.isConfigured(conversion).should.be.false;
        });
    });

    describe("apply(conversion, input)", function() {
        it("should sharpen image using configured radius, sigma, amount and threshold", function() {
            const radius = 1;
            const sigma = 2;
            const amount = 3;
            const threshold = 4;

            getConfig.withArgs("convert[" + conversion + "].unsharp.radius").returns(radius);
            getConfig.withArgs("convert[" + conversion + "].unsharp.sigma").returns(sigma);
            getConfig.withArgs("convert[" + conversion + "].unsharp.amount").returns(amount);
            getConfig.withArgs("convert[" + conversion + "].unsharp.threshold").returns(threshold);

            sut.apply(conversion, {
                unsharp: unsharp
            });

            unsharp.should.have.been.calledWith(radius, sigma, amount, threshold);
        });

        it("should return result of sharpening", function() {
            const output = "output";

            unsharp.returns(output);

            sut.apply(conversion, {
                unsharp: unsharp
            }).should.equal(output);
        });
    });
});
