import DatabaseManager from "../Managers/DatabaseManager.js";
import GameServer from "../server/Server.js";

export const OnEnd = (socket: any) => () => {    
    console.log(`클라 연결 종료 ${socket.remoteAddress} ${socket.remotePort}`);

    // 접속이 끊긴 유저를 가져옴
    const endUser = GameServer.GetInstance().GetUserBySocket(socket);    
    // DB에 마지막 위치값 저장
    DatabaseManager.GetInstance().RemoveUser(endUser);

    // 서버에서 유저 삭제
    GameServer.GetInstance().RemoveUser(socket);
}