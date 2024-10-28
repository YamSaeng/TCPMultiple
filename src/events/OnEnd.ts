import GameServer from "../server/Server.js";

export const OnEnd = (socket: any) => () => {
    console.log("클라 연결 종료", socket.remoteAddress, socket.remotePort);

    GameServer.GetInstance().RemoveUser(socket);    
}