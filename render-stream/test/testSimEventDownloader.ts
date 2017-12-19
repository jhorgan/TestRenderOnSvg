import { expect } from "chai";
import { suite, test, slow, timeout } from "mocha-typescript";
import "mocha";
import { SimEventDownloader } from "../src/simEventDownloader";

@suite
class TestSimEventDownloader {

    @test
    async whenStartCalledItShouldStartDownloading() {
        // arrange
        let dataChunk: string = "";
        let isEnd = false;

        let downloader = new SimEventDownloader({
            onerror: (message: string) => {
                console.error(message);
            },
            ondata: (data: string) => {
                console.log("ondata");
                dataChunk = data;
                console
            },
            onend: () => {
                console.log("onend");
                isEnd = true;
            },
            url: "https://lannerexperimentation.blob.core.windows.net/test/W3DServer.real.xml?st=2017-12-19T10%3A26%3A00Z&se=2021-12-18T10%3A26%3A00Z&sp=rl&sv=2015-12-11&sr=b&sig=mmqGSp%2BrWaEbQDVoe1WQryDt%2FYoAMps%2Ffq8u5Wwhqe0%3D"
        });

        // act
        return downloader.download().then((response) => {
            let len = dataChunk.length;
            console.log(`Data ${len}`);
            console.log(dataChunk);
            // expect(len).greaterThan(0);
        }).catch((error) => {
            console.log(error);
            expect(false).to.equals(true);
        });
    }
}
