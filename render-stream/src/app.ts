import * as $ from "jquery";
import { SimEventManager } from "./simEventManager";
import { ISimEventCommand, SimEventParser } from "./simEventParser";
import { SimEventDownloader } from "./simEventDownloader";
declare var Snap: any;

export class App {

    public async handleDownload(e: Event): Promise<void> {
        console.log("Start downloading");

        const service = new SimEventManager();
        const data = await service.getData();
        console.log(`${data.ip}`);
    }

    public handleChange(e: Event): void {
        console.log("Change...");
        const snap = Snap("#svg");

        const group = snap.g();
        group.attr({ id: "shape-template" });

        const rect = snap.rect(0, 0, 50, 50);
        group.add(rect);
        group.toDefs();

        const newShape = snap.use("shape-template");
        newShape.attr({ id: "shape-1", x: "100", y: "100" });

        console.log(newShape);
    }

    public handleParse(e: Event) {
        console.log("Parsing...");

        const parser = new SimEventParser((command: ISimEventCommand): void => {

        });

        const xml = `<root><create time='0.000000'
        geometry='C:\Users\Public\Documents\Lanner Group\WITNESS 21 Horizon\W3D\Assets\Shapes\dg-pq-Buffer'
        instanceName='[121] Buffers001(1) - Part Queue'>
            <queueInfo queueParent='dg-pq-Buffer'>
                <behaviour partPositioning='partOver' partRoll='0.000000' partPitch='0.000000' partYaw='0.000000' />
                <position x='0.000000' y='0.000000' z='0.000000' />
                <direct`;
        parser.parse(xml);
    }

    public async handleDownload2(e: Event) {
        console.log("Download2...");

        const downloader = new SimEventDownloader({
            onerror: (message: string) => {
                console.error(message);
            },
            ondata: (data: string) => {
                console.log("ondata");
                console.log(data);
            },
            onstopped: () => {                
                console.log("onstopped");
            },
            onend: () => {
                console.log("onend");
            },
            url: "https://lannertest.blob.core.windows.net/test/W3DServer.real.xml?st=2017-12-19T10%3A26%3A00Z&se=2021-12-18T10%3A26%3A00Z&sp=rl&sv=2015-12-11&sr=b&sig=oPPagICkXutrNxolCi404IDlU7MPS1tvhMA7L8oF5Xw%3D"
        });

        await downloader.download();
    }
}

$(() => {
    const app = new App();

    const downloadBtn = jQuery("#downloadButton");
    downloadBtn.on("click", (e: any) => { app.handleDownload(e); });

    const changeBtn = jQuery("#changeButton");
    changeBtn.on("click", (e: any) => { app.handleChange(e); });

    const parseBtn = jQuery("#parseButton");
    parseBtn.on("click", (e: any) => { app.handleParse(e); });

    const downloadBtn2 = jQuery("#downloadButton2");
    downloadBtn2.on("click", (e: any) => { app.handleDownload2(e); });
});
