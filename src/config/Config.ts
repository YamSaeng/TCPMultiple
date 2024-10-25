import { PORT, HOST, CLIENT_VERSION, DB1_NAME, DB1_USER, DB1_PASSWORD, DB1_HOST, DB1_PORT } from "../constants/Env.js";

export const config = {
    gameserver: {
        port: PORT,
        host: HOST
    },
    client: {
        version: CLIENT_VERSION
    },
    databases:{
        USER_DB:{
            name: DB1_NAME,
            user: DB1_USER,
            password: DB1_PASSWORD,
            host: DB1_HOST,
            port:DB1_PORT
        }
    }
}