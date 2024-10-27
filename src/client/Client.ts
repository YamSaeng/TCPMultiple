import net from "net";
import protobuf from "protobufjs";
import GameServer from "../server/Server.js";
import FileParser from "../FileParser.js";
import { config } from "../config/Config.js";
import { packetNames } from "../protobuf/packetNames.js";
import { PACKET_TYPE, PACKET_TYPE_LENGTH, TOTAL_LENGTH } from "../constants/PacketType.js";

let protoMessages: { [key: string]: any } = {};

async function LoadProtos() {
    try {
        const protoFilesDir = FileParser.GetInstance().GetDir("./protobuf");
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
const client = new net.Socket();

let userId: any;

function CreatePacket(handlerId: any, payload: any, clientVersion = "1.0.0", type: any, name: any) {
    const payLoadType = protoMessages[type][name];   
    if (!payLoadType) {
        console.log("PayloadType을 찾을 수 없습니다.");
    }

    const payloadMessage = payLoadType.create(payload);
    const payloadBuffer = payLoadType.encode(payloadMessage).finish();

    return {
        handlerId,
        userId,
        clientVersion,
        payload: payloadBuffer
    }
}

function SendPacket(socket: any, packet: any) {    
    const Packet = protoMessages.common.Packet;
    if(!Packet)
    {
        console.error("Packet 메세지를 찾을 수 없습니다.");
        return;
    }

    const buffer = Packet.encode(packet).finish();

    const packetLength = Buffer.alloc(TOTAL_LENGTH);
    packetLength.writeUInt32BE(buffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH,0);

    const packetType = Buffer.alloc(PACKET_TYPE_LENGTH);
    packetType.writeUInt8(PACKET_TYPE.NORMAL, 0);

    const packetWithLength = Buffer.concat([packetLength, packetType, buffer]);
    socket.write(packetWithLength);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

client.connect(5555, config.gameserver.host, async () => {
    console.log("서버와 연결");

    setTimeout(async () => {
        const gameInitialPacket = CreatePacket(0, { deviceId: "xxxx1xx" }, "1.0.0", "gameInitial", "GameInitialPacket");
        
        await SendPacket(client, gameInitialPacket);                
    }, 500);
});

client.on("data", (data)=>{    
});

client.on("close", () => {
    console.log("클라 소켓 종료");
});