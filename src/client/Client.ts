import net from "net";
import protobuf from "protobufjs";
import FileParser from "../FileParser.js";
import { config } from "../config/Config.js";
import { packetNames } from "../protobuf/packetNames.js";
import { PACKET_TYPE, PACKET_TYPE_LENGTH, TOTAL_LENGTH } from "../constants/PacketType.js";
import { HANDLER_IDS } from "../constants/HandlerIds.js";

let protoMessages: { [key: string]: any } = {};

async function LoadProtos() {
    try {
        const protoFilesDir = FileParser.GetInstance().GetDir("../src/protobuf");
        const protoFiles = FileParser.GetInstance().GetAllFiles(protoFilesDir, ".proto");

        // protobuf 객체를 생성
        const root = new protobuf.Root();
        // protobuf를 이용해 proto를 로드
        await Promise.all(protoFiles.map((file: any) => root.load(file)));

        for (const [pacakageName, types] of Object.entries(packetNames)) {
            protoMessages[pacakageName] = {};
            for (const [type, typeName] of Object.entries(types)) {
                protoMessages[pacakageName][type] = root.lookupType(typeName);
            }
        }

        console.log("Protobuf 파일을 로드했습니다.");
    } catch (error) {
        console.error("Protobuf 파일 로드 중 오류가 발생했습니다.", error);
    }
}

LoadProtos();

let deviceIdIndex = 1;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DummyClients = [] as Client[];

class Client {
    private clientSocket: any;
    private userId: any;
    private deviceId: any;
    private x: number;
    private y: number;
    private randomMoveInterval: any;

    constructor() {
        this.clientSocket = new net.Socket();
        this.userId = undefined;
        this.deviceId = undefined;
        this.randomMoveInterval = null;
        this.x = 0;
        this.y = 0;
    }

    CreatePacket(handlerId: any, clientVersion = "1.0.0", type: any, name: any, payload: any) {
        const payLoadType = protoMessages[type][name];
        if (!payLoadType) {
            console.log("PayloadType을 찾을 수 없습니다.");
        }

        const payloadMessage = payLoadType.create(payload);
        const payloadBuffer = payLoadType.encode(payloadMessage).finish();

        return {
            handlerId,
            userId: this.deviceId,
            clientVersion,
            payload: payloadBuffer
        }
    }

    async CreateLocationUpdate() {
        const randomMoveX = Math.floor(Math.random() * 2);
        const randomMoveY = Math.floor(Math.random() * 2);
        const randomX = Math.floor(Math.random() * 3);
        const randomY = Math.floor(Math.random() * 3);

        switch (randomMoveX) {
            case 0:
                this.x -= randomX;
                break;
            case 1:
                this.x += randomX;
                break;
        }

        switch (randomMoveY) {
            case 0:
                this.y -= randomY;
                break;
            case 1:
                this.y += randomY;
                break;
        }

        if (this.x > 30) {
            this.x = 30
        }
        else if (this.x < -30) {
            this.x = -30;
        }

        if (this.y > 30) {
            this.y = 30
        }
        else if (this.y < -30) {
            this.y = -30;
        }


        let locationUpdatePayload = {
            x: this.x,
            y: this.y
        };

        const locationUpdatePacket = this.CreatePacket(HANDLER_IDS.LOCATION_UPDATE, "1.0.0", "requestGame", "LocationUpdatePayload", locationUpdatePayload);
        await this.SendPacket(locationUpdatePacket);        
    }

    SendPacket(packet: any) {
        const Packet = protoMessages.common.Packet;
        if (!Packet) {
            console.error("Packet 메세지를 찾을 수 없습니다.");
            return;
        }

        const buffer = Packet.encode(packet).finish();

        const packetLength = Buffer.alloc(TOTAL_LENGTH);
        packetLength.writeUInt32BE(buffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH, 0);

        const packetType = Buffer.alloc(PACKET_TYPE_LENGTH);
        packetType.writeUInt8(PACKET_TYPE.NORMAL, 0);

        const packetWithLength = Buffer.concat([packetLength, packetType, buffer]);
        this.clientSocket.write(packetWithLength);
    }

    Connect() {
        this.clientSocket.connect(5555, config.gameserver.host, async () => {
            console.log(`${config.gameserver.host} : 5555 서버와 연결`);

            setTimeout(async () => {
                let playerId = Math.floor(Math.random() * 4);
                let latency = Date.now();

                let payload = {
                    deviceId: `x${deviceIdIndex} `,
                    playerId,
                    latency,
                    x:0,
                    y:0
                };

                this.deviceId = payload.deviceId;

                deviceIdIndex++;

                const gameInitialPacket = this.CreatePacket(HANDLER_IDS.INITIAL, "1.0.0", "gameInitial", "GameInitialPacket", payload);
                await this.SendPacket(gameInitialPacket);
            }, 500);

            this.clientSocket.on("data", (data: any) => {
                const length = data.readUInt32BE(0);
                const totalHeaderLength = TOTAL_LENGTH + PACKET_TYPE_LENGTH;

                const packetType = data.readUInt8(4);
                const packet = data.slice(totalHeaderLength, totalHeaderLength + length);

                switch (packetType) {                    
                    case PACKET_TYPE.NORMAL:
                        const Response = protoMessages.response.Response;
                        const gameInitialProto = protoMessages.gameInitial.GameInitialPacket;

                        try {
                            const response = Response.decode(packet);
                            const responseData = gameInitialProto.decode(response.data);
                            
                            if (response.handlerId === HANDLER_IDS.INITIAL) {                                
                                this.userId = responseData.deviceId;
                                this.x = responseData.x;
                                this.y = responseData.y;

                                this.randomMoveInterval = setInterval(this.CreateLocationUpdate.bind(this), 100);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        break;
                }
            });

            this.clientSocket.on("close", () => {
                console.log(`${this.deviceId} 클라 소켓 종료`);
            });
        });
    }

    Close() {        
        clearInterval(this.randomMoveInterval);
        this.clientSocket.end();
    }
}

async function DummyClientCreate(count: number) {
    for (let i = 0; i < count; i++) {
        const dummyClient = new Client();
        DummyClients.push(dummyClient);

        dummyClient.Connect();
        await delay(100);
        //dummyClient.Close();  
    }
}

// 백프레셔 현상
DummyClientCreate(1).then(async (data) => {
    console.log("완료");    

    // await delay(5000);
    // for (let i = 0; i < DummyClients.length; i++) {
    //     DummyClients[i].Close();        
    //     await delay(100);
    // }
});