import { CreatePingPacket } from "../server/packet/MakePacket.js";

class User {
    private id: number;
    private playerId: number;
    private socket: any;
    private x: number;
    private y: number;
    private lastUpdateTime: number;
    private latency: number;

    constructor(id: number, socket: any) {
        this.id = id;
        this.playerId = 0;
        this.socket = socket;
        this.x = 0;
        this.y = 0;
        this.lastUpdateTime = Date.now();
        this.latency = 0;
    }

    Ping() {
        const now = Date.now();

        console.log(`${this.id}: ping`);
        this.socket.write(CreatePingPacket(now));
    }

    HandlePong(data: any) {
        const now = Date.now();

        this.latency = (now - data.timestamp) / 2;
        console.log(`Receive pong user ${this.id} at ${now} with latency ${this.latency}ms`);
    }

    GetPlayerId()
    {
        return this.playerId;
    }

    SetPlayerId(playerId : number)
    {
        this.playerId = playerId;
    }    

    GetLatency()
    {
        return this.latency;
    }

    SetLatency(latency : number)
    {
        this.latency = latency;
    }

    GetPositionX()
    {
        return this.x;
    }

    GetPositionY()
    {
        return this.y;
    }

    UpdatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.lastUpdateTime = Date.now();
    }
}

export default User;