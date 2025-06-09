import { removeEmitHelper } from "../node_modules/typescript/lib/typescript";

export default class WireframeRendererDiagnostics {
    private lastLogTime: number;
    private lastStartTime: number;
    private count: number;
    private cumulativeDelta: number;

    public loggedFpsCount: number;
    public loggedDelta: number;

    public delta!: number;
    public objectDrawCalls!: number
    public lineDrawCalls!: number
    public objectDrawCallsDiscarded!: number
    public lineDrawCallsDiscarded!: number

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

    public Start(){
        this.count += 1;
        this.lastStartTime = Date.now();
        this.Clear();
    }

    public End(){
        let now = Date.now();
        this.delta = now - this.lastStartTime;
        this.cumulativeDelta += this.delta;
        if (now - this.lastLogTime > 1000){
            this.lastLogTime = now;
            this.loggedDelta = Math.round(this.cumulativeDelta / this.count);
            this.loggedFpsCount = this.count;
            this.cumulativeDelta = 0;
            this.count = 0;
        }
    }
 
    public Clear() {
        this.delta = 0;
        this.objectDrawCalls = 0;
        this.objectDrawCallsDiscarded = 0;
        this.lineDrawCalls = 0;
        this.lineDrawCallsDiscarded = 0;
    }
}