import { config } from "../config/Config.js";
import { PACKET_TYPE, TOTAL_LENGTH } from "../constants/PacketType.js";
import DatabaseManager from "../Managers/DatabaseManager.js";
import GameServer from "../server/Server.js";

export const OnData = (socket: any) => async (data: any) => {
    // 기존 소켓 buffer에 새로 수신한 데이터를 더해 저장
    socket.buffer = Buffer.concat([socket.buffer, data]);

    const totalHeaderLength = config.packet.totalLength + config.packet.typeLength;

    // socket 버퍼에 최소한 헤더 크기만큼 데이터가 왔는지를 확인
    while (socket.buffer.length >= totalHeaderLength) {
        // 패킷 길이 수신
        const length = socket.buffer.readUInt32BE(0);

        // 패킷 타입 수신
        const packetType = socket.buffer.readUInt8(TOTAL_LENGTH);

        // 실제로 데이터가 들어왔는지 확인
        if (socket.buffer.length >= length) {
            // payload 가져옴
            const packet = socket.buffer.slice(totalHeaderLength, length);
            // 다음 패킷을 받기 위해 나머지 부분을 잘라 socket buffer에 저장
            socket.buffer = socket.buffer.slice(length);

            const user = DatabaseManager.GetInstance().GetUserBySocket(socket);
            if (!user) {
                console.log("OnData user를 찾을 수 없음");
                return;
            }

            try {
                switch (packetType) {
                    case PACKET_TYPE.PING:
                        const protoMessages = GameServer.GetInstance().GetProtoMessages();
                        const pingProto = protoMessages.common.Ping;

                        const pingMessage = pingProto.decode(packet);

                        user.HandlePong(pingMessage);
                        break;
                }
            }
            catch (error) {
                console.log("OnData Error", error);
            }
        }
    }
}