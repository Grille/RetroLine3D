import Color from "./Color.js"
import Mesh from "./Mesh.js"
import Vec3 from "./Vec3.js"

export default class MeshInstance {

    public model: Mesh
    public center: Vec3
    public rotation: Vec3
    public location: Vec3
    public color: Color
    public scale: number

    constructor(mesh: Mesh) {
        this.model = mesh;
        this.center = Vec3.ZERO;
        this.rotation = Vec3.ZERO;
        this.location = Vec3.ZERO;
        this.color = new Color(1, 1, 1);
        this.scale = 1;
    }

}