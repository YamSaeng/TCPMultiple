import { config } from "../../config/Config.js";
import { GetProtoTypeNameByHandlerId } from "../handlers/Handlers.js";
import GameServer from "../Server.js"

export const PacketParser = (data: any) => {
    const protoMessages = GameServer.GetInstance().GetProtoMessages();

    // 일반 proto 패킷 구조를 가져옴
    const commonPacket = protoMessages.common.Packet;

    // 매개변수로 받아온 data를 decode 함
    let packet;
    try {
        packet = commonPacket.decode(data);
    } catch (error) {
        console.error("PacketParser 패킷 디코딩 중 오류가 발생");
        return;
    }

    // 디코딩해서 나온 데이터를 저장
    const handlerId = packet.handlerId;
    const userId = packet.userId;
    const clientVersion = packet.clientVersion;

    // 클라 버전 확인
    if (clientVersion !== config.client.version) {
        console.error("PacketParser 클라이언트 버전이 일치하지 않습니다.");
        return;
    }

    // 핸들러에서 각각 사용하는 protoPacket의 type을 가져옴
    const protoTypeName = GetProtoTypeNameByHandlerId(handlerId);
    if (!protoTypeName) {
        console.error(`PacketParser 알 수 없는 핸들러 Id : ${handlerId}`);
        return;
    }

    // 가져온 protoTypeName을 .을 기준으로 분리해
    // namespace와 typeName에 각각 저장
    // 예) initial.InitialPacket
    // namespace : initial
    // typeName : InitialPacket
    const [namespace, typeName] = protoTypeName.split(".");
    const payloadType = protoMessages[namespace][typeName];

    // 핸들러에서 사용하는 패킷 구조로 decode
    let payload;

    try {
        payload = payloadType.decode(packet.payload);
    } catch (error) {
        console.error("PacketParser decode 패킷 구조가 일치하지 않습니다.");
        return;
    }

    // 필드 검증 추가 ( 패킷 구조가 일치하는지 확인 )
    const errorMessage = payloadType.verify(payload);
    if (errorMessage) {
        console.error("PacketParser verify 패킷 구조가 일치하지 않습니다.");
        return;
    }

    // 각 패킷의 값들이 정상적으로 포함되어 있는지 확인
    // 필드가 비어 있거나, 필수 필드가 누락된 경우 확인
    const expectedFields = Object.keys(payloadType.fields);
    const actualFields = Object.keys(payload);

    // 비어 있는 필드를 필터링
    const missingFields = expectedFields.filter((field) => !actualFields.includes(field));
    if (missingFields.length > 0) {
        console.error(`PacketParser 필수 필드가 누락되었습니다. : ${missingFields.join(', ')}`);
    }

    return { handlerId, userId, payload };
}