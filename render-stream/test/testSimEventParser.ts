import { expect } from "chai";
import { suite, test, slow, timeout } from "mocha-typescript";
import "mocha";
import { ISimEventCommand, SimEventParser, SimEventCommandType } from "../src/simEventParser";

@suite
class TestSimEventParser {

    @test
    when3DCommandIsEmptyElementItShouldParseCorrectly(): void {
        // arrange
        const xml = "<root><create time='0.000000' /><create time='0.000000' /></root>";

        let eventCount = 0;
        let type = SimEventCommandType.None;

        const parser = new SimEventParser((command: ISimEventCommand) => {
            type = command.type;
            eventCount++;
        });

        // act
        parser.parse(xml);

        // assert
        expect(eventCount).to.equal(2);
        expect(SimEventCommandType.Create).to.equal(type);
    }


    @test
    when3DCommandIsComplexItShouldParseCorrectly(): void {
        // arrange
        const xml: string = `
        <root>
            <create time='0.000000'
            geometry='C:\Users\Public\Documents\Lanner Group\WITNESS 21 Horizon\W3D\Assets\Shapes\dg-pq-Buffer'
            instanceName='[121] Buffers001(1) - Part Queue'>
                <queueInfo queueParent='dg-pq-Buffer'>
                    <behaviour partPositioning='partOver' partRoll='0.000000' partPitch='0.000000' partYaw='0.000000' />
                    <position x='0.000000' y='0.000000' z='0.000000' />
                    <direction dx='0.000000' dy='0.000000' dz='1.000000' />
                </queueInfo>
            </create>
            <create time='0.000000'></create>
            <create time='0.000000'/>
        </root>`;


        let eventCount = 0;

        const parser = new SimEventParser((command: ISimEventCommand) => {
            eventCount++;
        });

        // act
        parser.parse(xml);

        // assert
        expect(eventCount).to.equal(3);
    }

    @test
    when3DCommandIsNotCompleteParserShouldReturnNothing() {
        // arrange
        const xml: string = `
        <root>
            <create time='0.000000'
            geometry='C:\Users\Public\Documents\Lanner Group\WITNESS 21 Horizon\W3D\Assets\Shapes\dg-pq-Buffer'
            instanceName='[121] Buffers001(1) - Part Queue'>
                <queueInfo queueParent='dg-pq-Buffer'>
                    <behaviour partPositioning='partOver' partRoll='0.000000' partPitch='0.000000' partYaw='0.000000' />
                    <position x='0.000000' y='0.000000' z='0.000000' />
                    <direction dx='0.00`;


        let eventCount = 0;

        const parser = new SimEventParser((command: ISimEventCommand) => {
            eventCount++;
        });

        // act
        parser.parse(xml);

        // assert
        expect(eventCount).to.equal(0);
    }

    @test
    whenParserInvokedWithMultipleCommandChunksShouldParseAllCommands() {
        // arrange
        const xml1 = `<root>
            <create time='0.000000' />
            <create time='0.000000'
            geometry='C:\Users\Public\Documents\Lanner Group\WITNESS 21 Horizon\W3D\Assets\Shapes\dg-pq-Buffer'
            instanceName='[121] Buffers001(1) - Part Queue'>
                <queueInfo queueParent='dg-pq-Buffer'>
                    <behaviour partPositioning='partOver' partRoll='0.000000' partPitch='0.000000' partYaw='0.000000' />
                    <position x='0.000000' y='0.000000' z='0.000000' />
                    <direction dx='0.00`;

        const xml2 = `0000' dy='0.000000' dz='1.000000' />
                </queueInfo>
            </create>
            <create time='0.000000'></create>
            <create time='0.000000'/>
        </root>`;

        let eventCount = 0;

        const parser = new SimEventParser((command: ISimEventCommand) => {
            eventCount++;
        });

        // act
        parser.parse(xml1);
        parser.parse(xml2);

        // assert
        expect(eventCount).equals(4);
    }    
}
