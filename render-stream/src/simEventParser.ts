import { xml2json } from "xml-js";
import { SAXParser } from "sax";

/**
 * Types of commands send from the sim engine
 */
export enum SimEventCommandType {
    None,
    Load,
    Create,
    Update,
    Delete,
}

/**
 * Command payload
 */
export interface ISimEventCommand {
    type: SimEventCommandType;
    command: any;
}

// Typedef for the function callback, raised when a 3D command is parsed from the stream
export type SimEventParserCallback = (commandText: ISimEventCommand) => void;

/**
 * Parse the supplied buffer of 3D xml commands into a series of json objects.
 * 
 * Data is read by the SimEventDownloader in chunks and passed to the SimEventParser to 
 * read the 3D xml commands.
 * 
 * Handles partially constructed xml data by storing any incomplete data, that 
 * won't parse correctly, in a buffer which is saved for the next time the parse
 * method is called
 */
export class SimEventParser {

    /**
     * the remaining xml data from a previous call to parse()
     */
    private remainingBuffer: string;

    /**
     * Constructor.
     * 
     * @param callback - invoked when a 3D command is parsed from the supplied buffer
     */
    constructor(readonly callback: SimEventParserCallback) {

    }

    /**
     * Parse the supplied buffer of WITNESS 3D xml commands into a series of json objects.
     * 
     * @param buffer - a chunk of xml data that represents the simulation events saved during  
     * a model run. As there are many simulation events for a model run, the buffer 
     * will not contained a completed set of simulation events for a run. Therefore it may 
     * or may not contained well formed xml
     */
    public parse(buffer: string): void {
        let currentCommand = "";
        let currentCommandType = SimEventCommandType.None;
        let startTagPosition = -1;

        let parser = new SAXParser(true, { });
        parser.onopentag = (node) => {

            // start of a 3D command
            if (this.is3DCommand(node.name)) {
                startTagPosition = parser.startTagPosition - 1; // startTagPosition is 1 based

                currentCommand = node.name;
                currentCommandType = this.simEventCommandTypeFromCommandName(currentCommand);
            }
        }
        parser.onclosetag = (node) => {

            // end of a 3D command
            if (this.is3DCommand(node) && startTagPosition != -1) {
                let xmlText = buffer.substring(startTagPosition, parser.position); 

                const json = JSON.parse(xml2json(xmlText, { compact: true }));
                this.callback({ type: currentCommandType, command: json });

                startTagPosition = -1;
            }
        }

        buffer = (this.remainingBuffer || "") + buffer;
        parser.write(buffer);

        // save any left over xml data for the next invocation
        if (startTagPosition !== -1) {
            this.remainingBuffer = buffer.substring(startTagPosition); 
        }
    }

    /**
     * Determine if the specified xml tag is a 3D command.
     * 
     * @param xmlTag - xml tag
     */
    private is3DCommand(xmlTag: string): boolean {
        const commands = ["load", "create", "update", "delete"];
        return commands.indexOf(xmlTag) != -1;
    }

    /**
     * Convert the specified 3D command name (string) to the simEventCommandType
     * enumeration.
     * 
     * @param command - 3D command
     */
    private simEventCommandTypeFromCommandName(commandName: string) {
        let type = SimEventCommandType.None;
        switch (commandName) {
            case "load":
                type = SimEventCommandType.Load;
                break;
            case "create":
                type = SimEventCommandType.Create;
                break;
            case "update":
                type = SimEventCommandType.Update;
                break;
            case "delete":
                type = SimEventCommandType.Delete;
                break;
        }
        return type;
    }
}
