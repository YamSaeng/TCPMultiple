import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from "../../constants/HandlerIds.js";
import DatabaseManager from "../../Managers/DatabaseManager.js";
import { CreateResponse } from "../packet/CreateResponse.js";
import GameServer from "../Server.js";

const GameInitialHandler = async ({ socket, userId, payload }: { socket: any; userId: any; payload: any; }) => {
    try {
        const { deviceId } = payload;

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
        GameServer.GetInstance().AddUser(socket, user.id);

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