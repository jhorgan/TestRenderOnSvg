import { worker } from "cluster";
import SimEventWorker = require("worker-loader!./SimEventWorker");

/**
 * Internal state used to control valid actions on the SimEventManager 
 */
enum State {
    Stopped,
    Run
}

/**
 * Options passed to the SimEventManager during construction
 */
interface ISimEventManagerOptions {
    url: string;
    onsimevent(event: object): void;
    onsimerror(message: string): void;
}

/**
 * Signature of the method used to receive data from the web worker
 */
type WebWorkerMessageCallback = (event: MessageEvent) => void;

/**
 * Defined else where, declare it so it can be used, perhaps the is a better way to
 * configure the location the webpack bundled code?
 */
declare var __webpack_public_path__: any;
__webpack_public_path__ = "/dist/";

/**
 * The manager that handles downloading and "playing" simulation events
 */
export class SimEventManager {

    /**
     * Current state of execution
     */
    private state: State = State.Stopped;

    /**
     * Download worker that handles downloading sim commands in the background
     */
    private downloadWorker: Worker | null;

    /**
     * Constructor
     */
    constructor(readonly options: ISimEventManagerOptions) {

        // Create the background worker to download and parse sim commands
        this.downloadWorker = this.createDownloadWorker(this.onDownloadWorkerMessage);
        if (!this.downloadWorker) {
            this.raiseError("SimEventManager: The browser does not support 'Web Worker'.");
        }
    }

    /**
     * Reset the download position to the start of the simulation event stream.
     * Must only be invoked when the SimEventManager is in a stopped state 
     * 
     * @returns true if the begin was successfull, otherwise false
     */
    public begin(): boolean {
        let success = false;

        if (this.state == State.Stopped) {

            success = true;
        }

        return success;
    }

    /**
     * Run the model by rendering the simulation events.
     * Must only be invoked when the SimEventManager is in a Stopped state 
     * 
     * @returns true if the model was able to run (play events), otherwise false
     */
    public run(): boolean {
        let success = false;

        if (!this.downloadWorker) {
            this.raiseError("SimEventManager: The browser does not support 'Web Worker'.");
        }

        if (this.state == State.Stopped) {

            this.startDownloadWorker();
            this.state = State.Run;
            success = true;
        }

        return success;
    }

    /**
     * Stop processing simulation events
     * Must only be invoked when the SimEventManager is in a Run state 
     * 
     * @returns true if the model was able to stop, otherwise false
     */
    public stop(): boolean {
        let success = false;

        if (this.state == State.Run) {

            this.state = State.Stopped;
            success = true;
        }

        return success;
    }

    /**
     * Step to the next simulation event, like run but handles a single event at a time.
     * Must only be invoked when the SimEventManager is in a Run state
     * 
     * @returns true if the model was able to step, otherwise false
     */
    public step(): boolean {
        let success = false;

        if (this.state == State.Stopped) {

            success = true;
        }

        return success;
    }

    /**
     * Creates the download worker, backgroung operation which downloads 
     * and parses sim commands. 
     * 
     * @returns a new worker or null if Worker is not supported by the browser
     */
    private createDownloadWorker(onmessage: WebWorkerMessageCallback): Worker | null {
        let worker: Worker | null = null;

        if (typeof (Worker) !== "undefined") {
            worker = new SimEventWorker();
            worker.onmessage = onmessage;
        }
        return worker;
    }

    /**
     * Start the background download worker thread.
     */
    private startDownloadWorker(): void {
        if (!this.downloadWorker) {
            this.raiseError("SimEventManager: The browser does not support 'Web Worker'.");
        }
        else {
            this.downloadWorker.postMessage({
                cmd: "start",
                url: this.options.url
            });
        }
    }

    /**
     * Called by the download worker when there are sim commands available.
     */
    private onDownloadWorkerMessage(event: MessageEvent): void {
        console.log("Command passed from the worker to the SimEventManager");
    }

    /**
     * Helper to raise an error message to the caller
     * 
     * @param message - the error message
     */
    private raiseError(message: string): void {
        this.options.onsimerror(message);
    }
}
