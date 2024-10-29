import { config } from "../../config/Config.js";
import { PACKET_TYPE } from "../../constants/PacketType.js";
import GameServer from "../Server.js"

const MakePacket = (message: any, type: number) => {
    // 패킷 길이 정보를 포함한 버퍼를 생성한다.
    const packetLength = Buffer.alloc(config.packet.totalLength);

    packetLength.writeUint32BE(message.length
        + config.packet.totalLength
        + config.packet.typeLength, 0);

    const packetType = Buffer.alloc(config.packet.typeLength);
    packetType.writeUint8(type, 0);

    return Buffer.concat([packetLength, packetType, message]);
}

export const CreateUserLocationPacket = (users : any) => {
    const protoMessages = GameServer.GetInstance().GetProtoMessages();
    const allLocationProto = protoMessages.responseGame.LocationUpdate;

    const payload = { users };
    const message = allLocationProto.create(payload);
    const s2cAllLocationPacket = allLocationProto.encode(message).finish();

    return MakePacket(s2cAllLocationPacket, PACKET_TYPE.LOCATION);
}

export const CreatePingPacket = (timestamp: number) => {
    const protoMessages = GameServer.GetInstance().GetProtoMessages();

    const pingProto = protoMessages.common.Ping;

    const payload = { timestamp };
    const message = pingProto.create(payload);

    const s2cPingPacket = pingProto.encode(message).finish();
    return MakePacket(s2cPingPacket, PACKET_TYPE.PING);
}