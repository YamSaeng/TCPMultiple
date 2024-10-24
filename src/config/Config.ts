import { PORT, HOST, CLIENT_VERSION } from "../constants/Env.js";

export const config = {
    gameserver: {
        port: PORT,
        host: HOST
    },
    client: {
        version: CLIENT_VERSION
    }
}