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

    const prefix = "prefix";

    beforeEach(function() {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
        unsharp = sandbox.stub();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("isConfigured(prefix)", function() {
        it("should return true if unsharp configuration entry exists", function() {
            hasConfig.withArgs(prefix + "unsharp").returns(true);

            sut.isConfigured(prefix).should.be.true;
        });

        it("should return false if unsharp configuration entry does not exist", function() {
            hasConfig.withArgs(prefix + "unsharp").returns(false);

            sut.isConfigured(prefix).should.be.false;
        });
    });

    describe("apply(prefix, input)", function() {
        it("should sharpen image using configured radius, sigma, amount and threshold", function() {
            const radius = 1;
            const sigma = 2;
            const amount = 3;
            const threshold = 4;

            getConfig.withArgs(prefix + "unsharp.radius").returns(radius);
            getConfig.withArgs(prefix + "unsharp.sigma").returns(sigma);
            getConfig.withArgs(prefix + "unsharp.amount").returns(amount);
            getConfig.withArgs(prefix + "unsharp.threshold").returns(threshold);

            sut.apply(prefix, {
                unsharp: unsharp
            });

            unsharp.should.have.been.calledWith(radius, sigma, amount, threshold);
        });

        it("should return result of sharpening", function() {
            const output = "output";

            unsharp.returns(output);

            sut.apply(prefix, {
                unsharp: unsharp
            }).should.equal(output);
        });
    });
});
