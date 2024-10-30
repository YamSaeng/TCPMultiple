import { CreateUserLocationPacket } from "../packet/MakePacket.js";
import GameServer from "../Server.js";

const LocationUpdateHandler = async ({ socket, userId, payload }: { socket: any; userId: any; payload: any; }) => {
    try {
        const { x, y } = payload;

        const locationUpdateUser = GameServer.GetInstance().GetUserById(userId);
        if (!locationUpdateUser) {
            console.log(`[LocationUpdateHandler] User를 찾을 수 없습니다.`);
            return;
        }

        locationUpdateUser.UpdatePosition(x, y);
        const protoMessages = GameServer.GetInstance().GetProtoMessages();
        const usersLocation = GameServer.GetInstance().GetAllUserLocation(userId);
        const usersLocationPacket = CreateUserLocationPacket(protoMessages, usersLocation);
        socket.write(usersLocationPacket);
    }
    catch (error) {
        console.error("LocationUpdate Handler ", error);
    }
};

export default LocationUpdateHandler;