import { CreatePingPacket } from "../server/packet/MakePacket.js";
import GameServer from "../server/Server.js";

class User {
    private id: number;
    private playerId: number;
    private socket: any;
    private x: number;
    private y: number;
    private lastUpdateTime: number;
    private latency: number;
    public pongCount: number;

    constructor(id: number, socket: any) {
        this.id = id;
        this.playerId = 0;
        this.socket = socket;
        this.x = 0;
        this.y = 0;
        this.lastUpdateTime = Date.now();
        this.latency = 0;
        this.pongCount = 0;
    }

    HandlePong(data: any) {
        const now = Date.now();

        this.latency = (now - data.timestamp) / 2;
        console.log(`Receive pong user ${this.id} latency ${this.latency}ms`);

        this.pongCount = 0;
    }

    GetId()
    {
        return this.id;
    }

    GetSocket()
    {
        return this.socket;
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

    SetPositionX(x : number)
    {
        this.x = x;
    }    

    GetPositionY()
    {
        return this.y;
    }

    SetPositionY(y: number)
    {
        this.y = y;
    }

    UpdatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.lastUpdateTime = Date.now();
    }
}

export default User;