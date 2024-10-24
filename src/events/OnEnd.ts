
export const OnEnd = (socket: any) => () => {
    console.log("클라 연결 종료", socket.remoteAddress, socket.remotePort);
}