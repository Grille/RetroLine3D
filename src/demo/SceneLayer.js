import MeshInstance from "../MeshInstance.js";
import Vec3 from "../Vec3.js";
export default class SceneLayer {
    constructor(radius) {
        this.radius = radius;
        this.size = radius * 2;
        this.items = [];
    }
    CreateInstance(mesh) {
        let instance = new MeshInstance(mesh);
        instance.location = this.GetLocation();
        this.Push(instance);
        return instance;
    }
    Push(item) {
        this.items.push(item);
    }
    Clear() {
        this.items.length = 0;
    }
    GetLocation() {
        return Vec3.GetRndLocation(this.radius);
    }
    LockToCamera(camera) {
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
