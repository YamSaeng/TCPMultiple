import { config } from "../../config/Config.js";
import { PACKET_TYPE } from "../../constants/PacketType.js";
import GameServer from "../Server.js"

export const CreateResponse = (handlerId: any, responseCode: any, data :any = null, userId: any) => {
    const protoMessages = GameServer.GetInstance().GetProtoMessages();
    // response proto 구조를 가져옴
    const responseProto = protoMessages.response.Response;

    // 응답 데이터 생성
    const responsePayload = {
        handlerId,
        responseCode,
        timestamp: Date.now(),
        data: data ? Buffer.from(JSON.stringify(data)) : null
    };

    // response proto 구조로 인코딩
    const buffer = responseProto.encode(responsePayload).finish();

    // 패킷 총 길이 만큼의 buffer를 생성
    const packetLength = Buffer.alloc(config.packet.totalLength);
    // 기록할 패킷의 총 크기를 기록
    packetLength.writeUInt32BE(buffer.length +
        config.packet.totalLength + config.packet.typeLength, 0
    );

    // 패킷 타입 정보를 기록할 buffer를 생성
    const packetType = Buffer.alloc(config.packet.typeLength);
    // 패킷 타입 기록
    packetType.writeUInt8(PACKET_TYPE.NORMAL, 0);

    // 패킷 조립해서 반환
    return Buffer.concat([packetLength, packetType, buffer]);
}