class IntervalManager {
    private static gInstance: any = null;
    private intervals: any;
    private serverIntervals : any;
    static GetInstance() {
        if (IntervalManager.gInstance == null) {
            IntervalManager.gInstance = new IntervalManager();
        }

        return IntervalManager.gInstance;
    }

    private constructor() {
        this.intervals = new Map();
        this.serverIntervals = new Map();
    }

    AddIntervalForServer(intervalId: number, callback: any, interval: any, type = "server") {
        if(!this.serverIntervals.has(intervalId))
        {
            this.serverIntervals.set(intervalId,new Map());
        }

        this.serverIntervals.get(intervalId).set(
            type, setInterval(callback, interval)
        );
    }

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