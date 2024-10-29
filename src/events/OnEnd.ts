import DatabaseManager from "../Managers/DatabaseManager.js";
import GameServer from "../server/Server.js";

export const OnEnd = (socket: any) => () => {    
    console.log(`클라 연결 종료 ${socket.remoteAddress} ${socket.remotePort}`);

    const endUser = GameServer.GetInstance().GetUserBySocket(socket);    

    DatabaseManager.GetInstance().RemoveUser(endUser);

    GameServer.GetInstance().RemoveUser(socket);
}