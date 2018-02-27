import { SimEventDownloader, ISimEventDownloaderOptions } from "./SimEventDownloader";
import { SimEventParser, ISimEventCommand } from "./simEventParser";

/**
 * Worker implementation to combines the downloading and parsing of 3D commands
 */
class WorkerImpl {

    /**
     * downloads 3D commands and raises events to the WorkerImpl
     * when data is available
     */
    private downloader: SimEventDownloader;

    /**
     * xml parser for parsing 3D commands. As the downloader downloads the
     * data in byte chunks, that parser will handle partial xml data
     */
    private parser: SimEventParser;

    /**
     * Constructor
     */
    public constructor(readonly ctx: any) {
        this.parser = new SimEventParser(this.onSimEventCommand);
    }

    /**
     * Callback invoked when the xml parser parsers a sim event command
     * 
     * @param command - the 3D command
     */
    private onSimEventCommand(command: ISimEventCommand) {

    }

    /**
     * Downloads the 3D command from the specified url
     * 
     * @param url - the source of the 3D commands
     */
    public download(url: string): void {

        if (!this.downloader) {

            let options: ISimEventDownloaderOptions = {
                onerror: this.onDownloaderError,
                ondata: this.onDownloaderData,
                onstopped: this.onDownloaderStopped,
                onend: this.onDownloaderEnd,
                url: url
            }
            this.downloader = new SimEventDownloader(options);
        }
        this.downloader.download();
    }

    /**
     * Stops the downloader. The downloader instance maintains the last 
     * stopped position
     */
    public stop(): void {
        this.downloader.stop();
    }

    private onDownloaderError(message: string): void {

    }

    /**
     * Callback when there is a chunk of data received from the downloader
     * 
     * @param data - chunk of xml data (maybe incomplete)
     */
    private onDownloaderData(xmldata: string): void {

        // Parse the data and forward it to the SimEventManager

        // Post the data from this background worker to the ui thread
        this.ctx.postMessage({ data: xmldata });        
    }

    private onDownloaderStopped(): void {

    }

    private onDownloaderEnd(): void {

    }
}

/**
 * Messages passed from the caller (client) to the webworker (backgroung thread)
 */
const ctx: Worker = self as any;
const workerImpl = new WorkerImpl(ctx);

ctx.onmessage = (event: MessageEvent) => {

    console.log("SimEventWorker message: " + JSON.stringify(event.data));

    switch (event.data.cmd) {
        case "start":
            workerImpl.download(event.data.url);
            break;

        case "stop":
            workerImpl.stop();
            break;
    }
}
