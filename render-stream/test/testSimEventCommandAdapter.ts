import { SimEventCommandAdapter } from "../src/simEventCommandAdapter";
import { expect } from 'chai';
import { suite, test, slow, timeout } from "mocha-typescript";
import "mocha";

@suite
class TestSimEventCommandAdapter {

  @test
  whenValidCreateCommandShouldConvertToValidSvg() {
    // arrange    
    const adapter = new SimEventCommandAdapter();
    const xml = `<create time='0.000000' geometry='C:\Users\Public\Documents\Lanner Group\WITNESS 21 Horizon\W3D\Assets\Shapes\dg-pq-Buffer' instanceName='[121] Buffers001(1) - Part Queue'>
      <queueInfo queueParent='dg-pq-Buffer'>
        <behaviour partPositioning='partOver' partRoll='0.000000' partPitch='0.000000' partYaw='0.000000' />
        <position x='0.000000' y='0.000000' z='0.000000' />
        <direction dx='0.000000' dy='0.000000' dz='1.000000' />
      </queueInfo>
    </create>`;

    // act 
    const result = adapter.adaptCommand(xml);

    // assert
    expect(result).to.equal("test");
  }
}
