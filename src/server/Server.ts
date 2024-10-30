import net from "net";
import protobuf from "protobufjs";
import { config } from "../config/Config.js";
import { OnData } from "../events/OnData.js";
import { OnEnd } from "../events/OnEnd.js";
import { OnError } from "../events/OnError.js";
import FileParser from "../FileParser.js";
import { packetNames } from "../protobuf/packetNames.js";
import DatabaseManager from "../Managers/DatabaseManager.js";
import User from "../user/User.js";
import IntervalManager from "../Managers/IntervalManager.js";
import { CreatePingPacket } from "./packet/MakePacket.js";

class GameServer {
    private static gInstance: any = null;

    public recvCount: number;
    public sendCount: number;
    private server: any;

    private protoMessages: { [key: string]: any } = {};

    private userSessions: any[] = [];    

    private intervalManager: any;

    static GetInstance() {
        if (GameServer.gInstance == null) {
            GameServer.gInstance = new GameServer();
        }

        return GameServer.gInstance;
    }

    private constructor() {
        this.recvCount = 0;
        this.sendCount = 0;
        this.server = net.createServer(this.Accept);  
        this.intervalManager = new IntervalManager();      
    }

    TestAllDBConnection() {
        DatabaseManager.GetInstance().TestAllDBConnection();
    }

    CreateSchemas() {
        DatabaseManager.GetInstance().CreateSchemas();
    }

    async LoadProtos() {
        try {
            // src에 protobuf 넣기
            const protoFilesDir = FileParser.GetInstance().GetDir("../src/protobuf");
            //const protoFilesDir = FileParser.GetInstance().GetDir("./protobuf");            
            const protoFiles = FileParser.GetInstance().GetAllFiles(protoFilesDir, ".proto");

            // protobuf 객체를 생성
            const root = new protobuf.Root();
            // protobuf를 이용해 proto를 로드
            await Promise.all(protoFiles.map((file: any) => root.load(file)));

            for (const [pacakageName, types] of Object.entries(packetNames)) {
                this.protoMessages[pacakageName] = {};
                for (const [type, typeName] of Object.entries(types)) {
                    this.protoMessages[pacakageName][type] = root.lookupType(typeName);
                }
            }

            console.log("Protobuf 파일을 로드했습니다.");
        } catch (error) {
            console.error("Protobuf 파일 로드 중 오류가 발생했습니다.", error);
        }
    }

    GetProtoMessages() {
        return { ...this.protoMessages };
    }

    StartGameServer() {
        console.log("게임서버 시작");

        this.TestAllDBConnection();
        this.CreateSchemas();
        this.LoadProtos();

        this.Listen();
        
        this.intervalManager.AddIntervalForServer(0, this.ServerPrint.bind(this), 1000);                
    }

    ServerPrint() {
        console.log(`[User] : ${this.userSessions.length}
            `);

        this.sendCount = 0;
    }    

    Listen() {
        this.server.listen(config.gameserver.port, config.gameserver.host, () => {
            console.log(`서버가 ${config.gameserver.host}:${config.gameserver.port}에서 실행 중입니다.`);
            console.log(this.server.address());
        });
    }

    Accept(socket: any) {
        console.log("클라 접속", socket.remoteAddress, socket.remotePort);

        // 소켓 객체마다 buffer 속성을 추가해 각 클라마다 고유한 버퍼를 유지하도록 함
        socket.buffer = Buffer.alloc(0);

        socket.on("data", OnData(socket));
        socket.on("end", OnEnd(socket));
        socket.on("error", OnError(socket));        
    }    

    AddUser(uuid: any, socket: any, x: number = 0, y: number = 0) {
        const user = new User(uuid, socket);

        if (x !== 0) {
            user.SetPositionX(x);
        }

        if (y !== 0) {
            user.SetPositionY(y);
        }

        this.userSessions.push(user);
        return user;
    }

    RemoveUser(socket: any) {
        const index = this.userSessions.findIndex((user) => user.socket === socket);
        if (index !== -1) {
            return this.userSessions.splice(index, 1)[0];
        }
    }

    GetAllUserLocation(exceptId: string) {
        const usersLocation: any = [];

        this.userSessions.forEach(user => {
            if (user.id !== exceptId) {
                usersLocation.push({
                    id: user.id,
                    playerId: user.playerId,
                    x: user.x,
                    y: user.y
                });
            }
        });

        if (usersLocation.length > 0) {
            return usersLocation;
        }

        return null;
    }

    GetUserById(id: any) {
        return this.userSessions.find((user) => user.id === id);
    }

    GetUserBySocket(socket: any) {
        return this.userSessions.find((user) => user.socket === socket);
    }
}

export default GameServer;