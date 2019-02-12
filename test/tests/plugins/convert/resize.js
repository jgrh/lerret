"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const LerretError = require("../../../../lib/errors").LerretError;

describe("plugins/convert/resize.js", function() {
    //system under test
    const sut = require("../../../../lib/plugins/convert/resize");

    const config = require("../../../../lib/config");

    const sandbox = sinon.createSandbox();

    //stubs
    let crop;
    let getConfig;
    let gravity;
    let hasConfig;
    let resize;

    const prefix = "prefix";

    beforeEach(function () {
        crop = sandbox.stub();
        getConfig = sandbox.stub(config, "get");
        gravity = sandbox.stub();
        hasConfig = sandbox.stub(config, "has");
        resize = sandbox.stub();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("isConfigured(prefix)", function () {
        it("should return true if resize configuration entry exists", function () {
            hasConfig.withArgs(prefix + "resize").returns(true);

            sut.isConfigured(prefix).should.be.true;
        });

        it("should return false if resize configuration entry does not exist", function () {
            hasConfig.withArgs(prefix + "resize").returns(false);

            sut.isConfigured(prefix).should.be.false;
        });
    });

    describe("apply(prefix, input)", function () {
        it("should resize image with width and height if configured", function () {
            const height = 300;
            const width = 400;

            getConfig.withArgs(prefix + "resize.width", null).returns(width);
            getConfig.withArgs(prefix + "resize.height", null).returns(height);

            sut.apply(prefix, { resize: resize });

            resize.should.have.been.calledWith(width, height);
        });

        it("should allow width to be null when resizing an image", function () {
            const height = 300;
            const width = null;

            getConfig.withArgs(prefix + "resize.width", null).returns(width);
            getConfig.withArgs(prefix + "resize.height", null).returns(height);

            sut.apply(prefix, { resize: resize });

            resize.should.have.been.calledWith(width, height);
        });

        it("should allow height to be null when resizing an image", function () {
            const height = null;
            const width = 400;

            getConfig.withArgs(prefix + "resize.width", null).returns(width);
            getConfig.withArgs(prefix + "resize.height", null).returns(height);

            sut.apply(prefix, { resize: resize });

            resize.should.have.been.calledWith(width, height);
        });

        it("should result of resizing", function () {
            const output = "output";

            resize.returns(output);

            sut.apply(prefix, { resize: resize }).should.equal(output);
        });

        it("should throw a LerretError if both width and height are null when resizing an image", function () {
            getConfig.withArgs(prefix + "resize.width", null).returns(null);
            getConfig.withArgs(prefix + "resize.height", null).returns(null);

            (() => sut.apply(prefix, { resize: resize })).should.throw(LerretError, "Resizing requires at least a width or a height");
        });

        it("should crop image with width and height if configured", function () {
            const height = 300;
            const width = 400;

            getConfig.withArgs(prefix + "resize.width", null).returns(width);
            getConfig.withArgs(prefix + "resize.height", null).returns(height);
            getConfig.withArgs(prefix + "resize.crop", false).returns(true);
            resize.returns({ gravity: gravity });
            gravity.returns({ crop: crop });

            sut.apply(prefix, { resize: resize });

            resize.should.have.been.calledWith(width, height, "^");
            gravity.should.have.been.calledWith("Center");
            crop.should.have.been.calledWith(width, height);
        });

        it("should result of cropping", function () {
            const output = "output";

            getConfig.withArgs(prefix + "resize.crop", false).returns(true);
            resize.returns({ gravity: gravity });
            gravity.returns({ crop: crop });
            crop.returns(output);

            sut.apply(prefix, { resize: resize }).should.equal(output);
        });

        it("should throw a LerretError if width is null when cropping an image", function () {
            getConfig.withArgs(prefix + "resize.width", null).returns(null);
            getConfig.withArgs(prefix + "resize.height", null).returns(300);
            getConfig.withArgs(prefix + "resize.crop", false).returns(true);

            (() => sut.apply(prefix, { resize: resize })).should.throw(LerretError, "Cropping requires both a width and a height");
        });

        it("should throw a LerretError if height is null when cropping an image", function () {
            getConfig.withArgs(prefix + "resize.width", null).returns(400);
            getConfig.withArgs(prefix + "resize.height", null).returns(null);
            getConfig.withArgs(prefix + "resize.crop", false).returns(true);

            (() => sut.apply(prefix, { resize: resize })).should.throw(LerretError, "Cropping requires both a width and a height");
        });
    });
});
