import Vec3 from "./Vec3.js";
class ProjectionResult {
    constructor(point1, point2, discarded = false) {
        this.point1 = point1;
        this.point2 = point2;
        this.discarded = discarded;
    }
}
ProjectionResult.DISCARD = new ProjectionResult(Vec3.ZERO, Vec3.ZERO, true);
export default ProjectionResult;
