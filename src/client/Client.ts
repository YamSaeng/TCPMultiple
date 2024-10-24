import { config } from "../config/Config.js";
import net from "net";

const client = new net.Socket();

client.connect(5555, config.gameserver.host, async () => {
   
});

client.on("close", () => {
    console.log("클라 소켓 종료");
});