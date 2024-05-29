import Color from "./Color.js"
import Mesh from "./Mesh.js"
import Vec3 from "./Vec3.js"

export default class MeshInstance {
    public drawDistance: number
    public model: Mesh
    public center: Vec3
    public rotation: Vec3
    public location: Vec3
    public color: Color
    public scale: number

    public sin: Vec3
    public cos: Vec3

    constructor(mesh: Mesh) {
        this.drawDistance = Number.MAX_SAFE_INTEGER;
        this.model = mesh;
        this.center = Vec3.ZERO;
        this.rotation = Vec3.ZERO;
        this.location = Vec3.ZERO;
        this.color = new Color(1, 1, 1);
        this.scale = 1;

        this.sin = new Vec3(0, 0, 0);
        this.cos = new Vec3(1, 1, 1);
    }

    public UpdateSinCos() {

        let rotate = this.rotation;
        let sin = this.sin;
        let cos = this.cos;

        if (rotate.x !== 0) {
            sin.x = Math.sin(rotate.x);
            cos.x = Math.cos(rotate.x);
        }
        if (rotate.y !== 0) {
            sin.y = Math.sin(rotate.y);
            cos.y = Math.cos(rotate.y);
        }
        if (rotate.z !== 0) {
            sin.z = Math.sin(rotate.z);
            cos.z = Math.cos(rotate.z);
        }
    }
}