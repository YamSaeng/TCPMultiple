import { PORT, HOST, CLIENT_VERSION, DB1_NAME, DB1_USER, DB1_PASSWORD, DB1_HOST, DB1_PORT, PONG_MAX_COUNT } from "../constants/Env.js";
import { TOTAL_LENGTH, PACKET_TYPE_LENGTH } from "../constants/PacketType.js";

export const config = {
    gameserver: {
        port: PORT,
        host: HOST,
        pongCount: PONG_MAX_COUNT
    },
    client: {
        version: CLIENT_VERSION
    },
    packet: {
        totalLength: TOTAL_LENGTH,
        typeLength: PACKET_TYPE_LENGTH
    },
    databases: {
        USER_DB: {
            name: DB1_NAME,
            user: DB1_USER,
            password: DB1_PASSWORD,
            host: DB1_HOST,
            port: DB1_PORT
        }
    }
}