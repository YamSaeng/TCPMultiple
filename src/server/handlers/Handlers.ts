import { HANDLER_IDS } from "../../constants/HandlerIds.js";
import GameInitialHandler from "./GameInitialHandler.js";

const handlers = {
    [HANDLER_IDS.INITIAL]: {
        handler: GameInitialHandler,
        protoType: "gameInitial.GameInitialPacket"
    }
}

export const GetHandlerById = (handlerId: number) => {
    if (!handlers[handlerId]) {
        console.log(`GetHandlerById 핸들러를 찾을 수 없습니다. ${handlerId}`);
        return;
    }

    return handlers[handlerId].handler;
}

export const GetProtoTypeNameByHandlerId = (handlerId: number) => {
    if(!handlers[handlerId])
    {
        console.log(`GetProtoTypeName 핸들러를 찾을 수 없습니다. ${handlerId}`);
        return;
    }

    return handlers[handlerId].protoType;
}