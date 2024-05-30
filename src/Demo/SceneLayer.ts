import Camera from "../Camera.js";
import Mesh from "../Mesh.js";
import MeshInstance from "../MeshInstance.js";
import Vec3 from "../Vec3.js";

export default class SceneLayer {
    public readonly size: number;
    public readonly radius: number;
    public readonly items: MeshInstance[]

    constructor(radius: number) {
        this.radius = radius
        this.size = radius * 2;
        this.items = [];
    }

    public CreateInstance(mesh: Mesh){
        let instance = new MeshInstance(mesh);
        instance.location = this.GetLocation();

        this.Push(instance);

        return instance;
    }

    public Push(item: MeshInstance){
        this.items.push(item);
    }

    public Clear(){
        this.items.length = 0;
    }

    public GetLocation() {
        return Vec3.GetRndLocation(this.radius)
    }

    public LockToCamera(camera: Camera){
        const radius = this.radius;
        const size = this.size;

        let cpos = camera.position;

        for (let i = 0; i < this.items.length; i++) {
            let obj = this.items[i];
            let pos = obj.location;
            
            if (pos.x > -cpos.x + radius) {
                pos.x -= size;
            }
    
            if (pos.x < -cpos.x - radius) {
                pos.x += size;
            }
    
            if (pos.z > -cpos.z + radius) {
                pos.z -= size;
            }
    
            if (pos.z < -cpos.z - radius) {
                pos.z += size;
            }
        }
    }
}