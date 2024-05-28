import Camera from "../Camera.js";
import MeshInstance from "../MeshInstance.js";
import Vec3 from "../Vec3.js";
import Meshes from "./Meshes.js";
import Color from "../Color.js";

export default class Scene {
    public clouds: MeshInstance[]
    public objects: MeshInstance[]

    constructor() {
        this.clouds = []
        this.objects = []
    }

    public Setup(meshes: Meshes) {
        for (let i = 0; i < 600; i++) {
            this.clouds.push({
                model: meshes.cloud,
                center: new Vec3(0, 0, 0),
                rotation: new Vec3(Math.random() * 5 / 180 * Math.PI, Math.random() * 360 / 180 * Math.PI, Math.random() * 0),
                location: new Vec3(Math.random() * 20000 - 10000, Math.random() * 100 + 2000, Math.random() * 20000 - 10000),
                color: new Color(200, 200, 220),
                scale: 10 * (Math.random() + 1),
                drawDistance: 1E400,
            })
        }

        for (let i = 0; i < 20000; i++) {
            this.objects.push({
                model: meshes.tree,
                center: new Vec3(0, 0, 0),
                rotation: new Vec3(Math.random() * 5 / 180 * Math.PI, Math.random() * 360 / 180 * Math.PI, Math.random() * 0),
                location: new Vec3(Math.random() * 10000 - 5000, 0, Math.random() * 10000 - 5000),
                color: new Color(Math.random() * 50, Math.random() * 50 + 50, Math.random()),
                scale: 5 * (Math.random() + 1),
                drawDistance: 2500 * (Math.random() + 1),
            })
        }

        for (let i = 0; i < 20; i++) {
            this.objects.push({
                model: meshes.house,
                center: new Vec3(0, 0, 0),
                rotation: new Vec3(0, Math.random() * 360, 0),
                location: new Vec3(Math.random() * 10000 - 5000, 0, Math.random() * 10000 - 5000),
                color: new Color(Math.random() * 20 + 90, Math.random() * 20 + 90, Math.random() * 20 + 90),
                scale: 10,
                drawDistance: 2500,
            })
        }
    }

    public LogicTick(camera: Camera) {
        for (let i = 0; i < this.clouds.length; i++) {
            let cloud = this.clouds[i];

            cloud.location.x += 0.5;
            this.LockToCamera(camera, cloud.location, 10000);

            const dist = camera.Distance(cloud.location);

            let f = (1 - Math.min(dist / 10000, 1)) * 220;
            cloud.color.r = f;
            cloud.color.g = f;
            cloud.color.b = f + 20;
        }

        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            this.LockToCamera(camera, obj.location, 5000);
        }
    }

    private LockToCamera(camera: Camera, pos: Vec3, radius: number) {
        let cpos = camera.position;

        if (pos.x > -cpos.x + radius) {
            pos.x = -cpos.x - radius;
        }

        if (pos.x < -cpos.x - radius) {
            pos.x = -cpos.x + radius;
        }

        if (pos.z > -cpos.z + radius) {
            pos.z = -cpos.z - radius;
        }

        if (pos.z < -cpos.z - radius) {
            pos.z = -cpos.z + radius;
        }
    }
}