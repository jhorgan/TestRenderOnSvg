import * as $ from "jquery";
import { SimEventManager } from "./simEventManager";
declare var Snap: any;

export class App {

    public async handleDownload(e: Event): Promise<void> {
        console.log("Start downloading");

        let service = new SimEventManager();
        let data = await service.getData();
        console.log(`${data.ip}`);
    }

    public handleChange(e: Event): void {
        console.log("Change...");
        let snap = Snap("#svg"); 
        let defs = snap.toDefs();

        defs.add();

        console.log(snap);
    }        
}

$(() => {
    const app = new App();

    let downloadBtn = jQuery("#downloadButton");
    downloadBtn.on("click", (e: any) => { app.handleDownload(e); });

    let changeBtn = jQuery("#changeButton");
    changeBtn.on("click", (e: any) => { app.handleChange(e); });

});