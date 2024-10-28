import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from "../../constants/HandlerIds.js";
import DatabaseManager from "../../Managers/DatabaseManager.js";
import { CreateResponse } from "../packet/CreateResponse.js";
import GameServer from "../Server.js";

const GameInitialHandler = async ({ socket, userId, payload }: { socket: any; userId: any; payload: any; }) => {
    try {
        const { deviceId, playerId, latency } = payload;

        console.log(`deviceID ${deviceId} playerId ${playerId} latency ${latency}`);        

        // DB에 접속한 대상이 저장되어 있는지 확인
        let user = await DatabaseManager.GetInstance().FindUserByDeviceId(deviceId);
        if (!user) {
            // 저장 되어 있지 않으면 새로 생성해 저장
            user = await DatabaseManager.GetInstance().CreateUser(deviceId);
        }
        else {
            // 저장 되어 있으면 Login 시간 업데이트
            await DatabaseManager.GetInstance().UpdateUserLogin(user.id);
        }               

        // 새로 들어온 유저를 저장
        const gameserverUser = GameServer.GetInstance().AddUser(deviceId, socket);
        if(!gameserverUser)
        {
            console.log("gameserverUser가 생성되지 않았습니다.");
        }        

        gameserverUser.SetPlayerId(playerId);
        gameserverUser.SetLatency(latency);

        // 이미 들어와 있는 유저들에게 새로 들어온 유저를 생성하라고 알려줌

        const gameInitialResponse = CreateResponse(
            HANDLER_IDS.INITIAL,
            RESPONSE_SUCCESS_CODE,
            { userId: user.id },
            deviceId
        );

        socket.write(gameInitialResponse);
    }
    catch (error) {
        console.error("GameInitial", error);
    }
};

export default GameInitialHandler;