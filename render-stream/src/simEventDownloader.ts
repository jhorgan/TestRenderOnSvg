
/**
 * Options passed to the SimEventDownloader during construction
 */
export interface ISimEventDownloaderOptions {
    onerror(message: string): void;
    ondata(data: string): void;
    onstopped(): void;
    onend(): void;
    url: string;
}

/**
 * Downloads WITNESS 3D xml commands as a series of chunks. The ondata
 * event is raised as each chunk is downloaded. The onerror event is raised 
 * when an error occurs and processing is stopped. The onend event is 
 * raised once all 3D commands are downloaded
 */
export class SimEventDownloader {

    /**
     * the next starting chunk position
     */
    private startPosition = 0;

    /**
     * true if the caller has requested to stop the download
     */
    private isStopped = false;

    /**
     * Constructor
     * 
     * @param options - downloader options
     */
    constructor(readonly options: ISimEventDownloaderOptions) {

    }

    /**
     * Download the data in chunks. The download can be stopped when the caller
     * invokes the stop method. The next start position is maintained so it 
     * can be resumed from the correct position
     */
    public async download(): Promise<void> {
        const chunkSize = Math.pow(2, 16);

        // get the data length (size of the all 3D events in bytes)
        let contentLength = await this.calculateContentLength();

        // reset the stopped flag
        this.isStopped = false;

        if (contentLength > 0) {
            let hasMore = false;

            do {
                // calc the chunk end position
                let endPosition = (this.startPosition + chunkSize < contentLength) ? this.startPosition + chunkSize : contentLength;

                // fetch the chunk of data
                let response = await fetch(this.options.url, SimEventDownloader.makeFetchOptions(this.startPosition, endPosition));
                if (response.status == 206) {

                    // console.log(`SimEventDownloader: Downloaded ${this.startPosition}-${endPosition} of ${contentLength}`);

                    // calc the next start and end chunk positions
                    this.startPosition = endPosition + 1;
                    endPosition = (this.startPosition + chunkSize < contentLength) ? this.startPosition + chunkSize : contentLength;

                    hasMore = endPosition > this.startPosition;

                    // raise the data present event
                    this.raiseOnData(await response.text());
                }
                else {
                    this.raiseErrorEvent(`SimEventDownloader: Error response.status != 206. Status: ${response.status}`);
                    hasMore = false;
                }

            } while (hasMore && !this.isStopped);

            // stopped by the user?
            if (this.isStopped) {
                this.raiseOnStopped();
            }

            // end of data event?
            if (!hasMore) {
                this.raiseOnEnd();
            }
        }
    }

    /**
     * Stop the current download at the next opportunity
     */
    public stop(): void {
        this.isStopped = true;
    }

    /**
     * Calculate the size of the stream.
     */
    private async calculateContentLength(): Promise<number> {

        let length = 0;

        let response = await fetch(this.options.url, SimEventDownloader.makeFetchOptions(0, 1));
        if (response.status == 206) {
            if (response.headers) {
                let contectRange = response.headers.get("Content-Range");
                if (contectRange) {
                    length = parseInt(contectRange.split("/")[1]);
                }
                else {
                    this.raiseErrorEvent(`SimEventDownloader: Content-Range header is not present in the response. Cannot calculate the ContentLength for '${this.options.url}'`);
                }
            }
            else {
                this.raiseErrorEvent(`SimEventDownloader: Response headers are empty. Cannot calculate the ContentLength for '${this.options.url}'`);
            }
        }
        else {
            this.raiseErrorEvent(`SimEventDownloader: Failed to get the content length for '${this.options.url}'. Expected Status == 206. Status: ${response.status}`);
        }

        return length;
    }

    /**
     * Create the options for the fetch api.
     * 
     * @param startPosition - the start position of the next chunk of data to retrieve
     * @param endPosition - the end position of the next chunk of data to retrieve
     */
    private static makeFetchOptions(startPosition: number, endPosition: number): any {

        let fetchOptions = {
            method: "GET",
            headers: {
                "Range": `bytes=${startPosition}-${endPosition}`,
            }
        };

        return fetchOptions;
    }

    /**
     * Raise the error event
     * 
     * @param message - error message
     */
    private raiseErrorEvent(message: string): void {
        console.error(message);
        this.options.onerror(message);
    }

    /**
     * Raise the data error
     * 
     * @param data - the data
     */
    private raiseOnData(data: string) {
        this.options.ondata(data);
    }

    /**
     * Raise the stopped event
     */
    private raiseOnStopped() {
        this.options.onstopped();
    }

    /**
     * Raise the end event
     */
    private raiseOnEnd() {
        this.options.onend();
    }
}