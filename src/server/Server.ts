import net from "net";
import { config } from "../config/Config.js";
import { OnData } from "../events/OnData.js";
import { OnEnd } from "../events/OnEnd.js";
import { OnError } from "../events/OnError.js";

class GameServer {
    public recvCount: number;
    public sendCount: number;
    private server: any;

    constructor() {
        this.recvCount = 0;
        this.sendCount = 0;
        this.server = net.createServer(this.Accept);
    }

    StartGameServer() {
        console.log("게임서버 시작");

        this.Listen();
    }

    Listen() {
        this.server.listen(config.gameserver.port, config.gameserver.host, () => {
            console.log(`서버가 ${config.gameserver.host}:${config.gameserver.port}에서 실행 중입니다.`);
            console.log(this.server.address());
        });
    }

    Accept(socket: any) {
        console.log("클라 접속", socket.remoteAddress, socket.remotePort);

        socket.on("data", OnData(socket));
        socket.on("end", OnEnd(socket));
        socket.on("error", OnError(socket));
    }
}

export default GameServer;