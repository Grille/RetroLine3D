import Color from "./Color.js";
import Vec3 from "./Vec3.js";
export default class MeshInstance {
    constructor(mesh) {
        this.drawDistance = Number.MAX_SAFE_INTEGER;
        this.model = mesh;
        this.center = Vec3.ZERO;
        this.rotation = Vec3.ZERO;
        this.location = Vec3.ZERO;
        this.color = new Color(1, 1, 1);
        this.scale = 1;
    }
}
