import GameServer from "./server/Server.js";

function Main() {
    GameServer.GetInstance().StartGameServer();    
}

Main();