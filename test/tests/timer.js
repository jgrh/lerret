"use strict";

/*global afterEach, beforeEach, describe, it, sinon*/

const rewire = require("rewire");

describe("timer.js", function() {
    //system under test
    const sut = rewire("../../lib/timer");

    const sandbox = sinon.createSandbox();

    //stubs
    let format;
    let hrtime;

    beforeEach(function () {
        format = sandbox.stub();
        hrtime = sandbox.stub(process, "hrtime");

        sut.__set__("format", format);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("stamp(event)", function () {
        it("should obtain the current timestamp", function () {
            sut.create().stamp("");

            hrtime.should.have.been.called;
        });
    });

    describe("since(event)", function () {
        it("should calculate the time interval", function () {
            const start = 123;

            hrtime.returns(start);

            sut.create().stamp("start").since("start");

            hrtime.should.have.been.calledWith(start);
        });

        it("should format the time interval", function () {
            const duration = 456;

            hrtime.onSecondCall().returns(duration);

            sut.create().stamp("start").since("start");

            format.should.have.been.calledWith(duration);
        });

        it("should return the formatted time interval", function () {
            const formatted = "some seconds";

            format.returns(formatted);

            const time = sut.create().stamp("start");

            time.since("start").should.equal(formatted);
        });
    });

    it("should allow multiple events to be timed", function () {
        const start1 = 1;
        const start2 = 2;
        const duration1 = 3;
        const duration2 = 4;
        const formatted1 = "some seconds";
        const formatted2 = "many minutes";

        hrtime.onFirstCall().returns(start1);
        hrtime.onSecondCall().returns(start2);
        hrtime.withArgs(start1).returns(duration1);
        hrtime.withArgs(start2).returns(duration2);
        format.withArgs(duration1).returns(formatted1);
        format.withArgs(duration2).returns(formatted2);

        const time = sut.create();
        time.stamp("start1");
        time.stamp("start2");

        time.since("start1").should.equal(formatted1);
        time.since("start2").should.equal(formatted2);
    });
});
