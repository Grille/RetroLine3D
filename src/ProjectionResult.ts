import Vec3 from "./Vec3.js";

export default class ProjectionResult {

    public static readonly DISCARD = new ProjectionResult(Vec3.ZERO, Vec3.ZERO, true)

    public point1: Vec3;
    public point2: Vec3;
    public discarded: boolean

    constructor(point1: Vec3, point2: Vec3, discarded: boolean = false) {
        this.point1 = point1;
        this.point2 = point2;
        this.discarded = discarded;
    }
}