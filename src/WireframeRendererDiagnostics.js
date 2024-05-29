export default class WireframeRendererDiagnostics {
    constructor() {
        let now = Date.now();
        this.cumulativeDelta = 0;
        this.loggedDelta = 0;
        this.loggedFpsCount = 0;
        this.lastLogTime = now;
        this.lastStartTime = now;
        this.count = 0;
        this.Clear();
    }
    Start() {
        this.count += 1;
        this.lastStartTime = Date.now();
        this.Clear();
    }
    End() {
        let now = Date.now();
        this.delta = now - this.lastStartTime;
        this.cumulativeDelta += this.delta;
        if (now - this.lastLogTime > 1000) {
            this.lastLogTime = now;
            this.loggedDelta = Math.round(this.cumulativeDelta / this.count);
            this.loggedFpsCount = this.count;
            this.cumulativeDelta = 0;
            this.count = 0;
        }
    }
    Clear() {
        this.delta = 0;
        this.objectDrawCalls = 0;
        this.objectDrawCallsDiscarded = 0;
        this.lineDrawCalls = 0;
        this.lineDrawCallsDiscarded = 0;
    }
}
