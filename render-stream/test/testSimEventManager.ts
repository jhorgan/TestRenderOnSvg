import { expect } from "chai";
import { suite, test, slow, timeout } from "mocha-typescript";
import "mocha";
import { SimEventManager } from "../src/simEventManager";

@suite
class TestSimEventManager {

    @test
    whenNotRunningBeginShouldSucceed(): void {
        // arrange
        let options = {
            url: "test.xml",
            onsimevent: (event: object) => {},
            onsimerror: (message: string) => {}
        };
        const manager = new SimEventManager(options);

        // act
        let success = manager.begin();

        // assert
        expect(success).to.equal(true);
    }

    @test
    whenRunningBeginShouldFail(): void {
        // arrange
        let options = {
            url: "test.xml",
            onsimevent: (event: object) => {},
            onsimerror: (message: string) => {}
        };
        const manager = new SimEventManager(options);

        // act
        manager.run();
        let success = manager.begin();

        // assert
        expect(success).to.equal(false);
    }

    @test
    whenRunningStepShouldFail(): void {
        // arrange
        let options = {
            url: "test.xml",
            onsimevent: (event: object) => {},
            onsimerror: (message: string) => {}
        };
        const manager = new SimEventManager(options);

        // act
        manager.run();
        let success = manager.step();

        // assert
        expect(success).to.equal(false);
    }

    @test
    whenRunningStopShouldSucceed(): void {
        // arrange
        let options = {
            url: "test.xml",
            onsimevent: (event: object) => {},
            onsimerror: (message: string) => {}
        };
        const manager = new SimEventManager(options);

        // act
        manager.run();
        let success = manager.stop();

        // assert
        expect(success).to.equal(true);
    }
}
