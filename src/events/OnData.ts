import { config } from "../config/Config.js";
import { PACKET_TYPE, TOTAL_LENGTH } from "../constants/PacketType.js";
import DatabaseManager from "../Managers/DatabaseManager.js";
import { GetHandlerById } from "../server/handlers/Handlers.js";
import { PacketParser } from "../server/packet/PacketParser.js";
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

            try {
                switch (packetType) {
                    case PACKET_TYPE.PING:
                        const protoMessages = GameServer.GetInstance().GetProtoMessages();
                        const pingProto = protoMessages.common.Ping;

                        const pingMessage = pingProto.decode(packet);

                        const pingUser = GameServer.GetInstance().GetUserBySocket(socket);
                        if (!pingUser) {
                            console.log("OnData user를 찾을 수 없음");
                            return;
                        }

                        pingUser.HandlePong(pingMessage);
                        break;
                    case PACKET_TYPE.NORMAL:
                        const { handlerId, userId, payload } = PacketParser(packet) as { handlerId: number; userId: any; payload: any };

                        const normalUser = GameServer.GetInstance().GetUserById(userId);
                        if (!normalUser) {
                            console.log("OnData user를 찾을 수 없음");
                            return;
                        }

                        const handler = GetHandlerById(handlerId);
                        await handler?.({ socket, userId, payload });
                        break;
                }
            } catch (error) {
                console.log("OnData Error", error);
            }
        }
        else {
            // 아직 전체 패킷이 도착하지 않음
            break;
        }
    }
}