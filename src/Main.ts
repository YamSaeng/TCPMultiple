import GameServer from "./server/Server.js";

const gameServer = new GameServer();

function Main() {
    gameServer.StartGameServer();    
}

Main();