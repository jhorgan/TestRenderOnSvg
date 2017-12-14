export interface ILocationData {
    ip: string;
    country_code: string;
    country_name: string;
};

export enum State {
    Downloading,
    Paused,
    Stopped
}

export class SimEventManager {
    private state: State;

    public start(position: number) {
        this.state = State.Downloading;
    }

    public getState(): State {
        return this.state;
    }

    public async getData() {
        let response = await fetch("http://freegeoip.net/json/");
        let data: ILocationData = await response.json();

        return data;
    }

    public downloadDataAsync(): Promise<string> {

        let p: Promise<string> = new Promise((resolve, reject) => {

        });
        return p;
    }
}
