// setInterval을 관리
class IntervalManager {    
    private intervals: any;
    private serverIntervals : any;    

    constructor() {
        this.intervals = new Map();
        this.serverIntervals = new Map();
    }

    // 서버용
    AddIntervalForServer(intervalId: number, callback: any, interval: any, type = "server") {
        if(!this.serverIntervals.has(intervalId))
        {
            this.serverIntervals.set(intervalId,new Map());
        }

        this.serverIntervals.get(intervalId).set(
            type, setInterval(callback, interval)
        );
    }

    // 플레이어용
    AddIntervalForPlayer(playerId: number, callback: any, interval: any, type = "user") {
        if (!this.intervals.has(playerId)) {
            this.intervals.set(playerId, new Map());
        }

        this.intervals.get(playerId).set(
            type, setInterval(callback, interval));
    }

    RemoveAllIntervalForPlayer(playerId: number) {
        if (this.intervals.has(playerId)) {
            const userIntervals = this.intervals.get(playerId);
            userIntervals.forEach((intervalId: any) => clearInterval(intervalId));
            this.intervals.delete(playerId);
        }
    }

    RemoveIntervalForPlayer(playerId: any, type: any) {
        if (this.intervals.has(playerId)) {
            const userIntervals = this.intervals.get(playerId);
            if (userIntervals.has(type)) {
                clearInterval(userIntervals.get(type));
                userIntervals.delete(type);
            }
        }
    }

    ClearAll() {
        this.intervals.forEach((userIntervals: any) => {
            userIntervals.forEach((intervalId: any) => clearInterval(intervalId));
        });

        this.intervals.clear();
    }
}

export default IntervalManager;