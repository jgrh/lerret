"use strict";

/*global afterEach, assert, beforeEach, describe, it, sinon*/

describe("plugins/match.js", function() {
    //system under test
    const sut = require("../../../lib/plugins/match");

    const config = require("../../../lib/config");

    const sandbox = sinon.createSandbox();

    //stubs
    let getConfig;
    let hasConfig;

    beforeEach(function() {
        getConfig = sandbox.stub(config, "get");
        hasConfig = sandbox.stub(config, "has");
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe("image(path, image)", function() {
        it("should return true if no match config section", function() {
            const path = "config.path";

            hasConfig.withArgs(path + ".match").returns(false);

            const result = sut.image(path, {});

            assert(result);
        });

        it("should return false if image does not have key", function() {
            const path = "config.path";

            hasConfig.returns(true);
            getConfig.withArgs(path + ".match.property").returns("key");
            getConfig.withArgs(path + ".match.regex").returns("");

            const result = sut.image(path, {
                "different": ""
            });

            assert(!result);
        });

        it("should return false if image has key and value does not match regex", function() {
            const path = "config.path";

            hasConfig.returns(true);
            getConfig.withArgs(path + ".match.property").returns("key");
            getConfig.withArgs(path + ".match.regex").returns(".*foo.*");

            const result = sut.image(path, {
                "key": "does not contain f00"
            });

            assert(!result);
        });

        it("should return true if image has key and value matches regex", function() {
            const path = "config.path";

            hasConfig.returns(true);
            getConfig.withArgs(path + ".match.property").returns("key");
            getConfig.withArgs(path + ".match.regex").returns(".*foo.*");

            const result = sut.image(path, {
                "key": "contains foo"
            });

            assert(result);
        });
    });
});
