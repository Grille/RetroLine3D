import Camera from "../Camera.js";
import MeshInstance from "../MeshInstance.js";
import Vec3 from "../Vec3.js";
import Meshes from "./Meshes.js";
import Color from "../Color.js";
import SceneLayer from "./SceneLayer.js";

export default class Scene {
    public clouds: SceneLayer
    public objects: SceneLayer
    public groundcover: SceneLayer

    constructor() {
        this.clouds = new SceneLayer(10000);
        this.objects = new SceneLayer(500);
        this.groundcover = new SceneLayer(50);
    }

    public Setup(meshes: Meshes) {

        for (let i = 0; i < 1000; i++) {
            let instance = this.clouds.CreateInstance(meshes.cloud);
            instance.rotation = new Vec3(Math.random() * Math.PI * 0.03, Math.random() * Math.PI * 2, 0);
            instance.location.y = Math.random() * 200 + 300;
            instance.color = new Color(200, 200, 220);
            instance.scale = 5 * (Math.random() + 1);
            instance.drawDistance = this.clouds.radius;
            instance.UpdateSinCos();
        }

        for (let i = 0; i < 100; i++) {
            let instance = this.clouds.CreateInstance(meshes.cloud);
            instance.rotation = new Vec3(Math.random() * Math.PI * 0.03, Math.random() * Math.PI * 2, 0);
            instance.location.y = Math.random() * 2000 + 1000;
            instance.color = new Color(200, 200, 220);
            instance.scale = 20 * (Math.random() + 1);
            instance.drawDistance = this.clouds.radius;
            instance.UpdateSinCos();
        }

        for (let i = 0; i < 20000; i++) {
            let instance = this.objects.CreateInstance(meshes.tree);
            instance.rotation = new Vec3(Math.random() * 5 / 180 * Math.PI, Math.random() * 360 / 180 * Math.PI, Math.random() * 0);
            instance.color = new Color(Math.random() * 50, Math.random() * 50 + 50, Math.random());
            instance.scale = 0.5 * (Math.random() + 1);
            instance.drawDistance = 250 * (Math.random() + 1);
            instance.UpdateSinCos();
        }

        for (let i = 0; i < 20; i++) {
            let instance = this.objects.CreateInstance(meshes.house);
            instance.rotation = new Vec3(0, Math.random() * 360, 0);
            instance.color = new Color(Math.random() * 20 + 90, Math.random() * 20 + 90, Math.random() * 20 + 90);
            instance.drawDistance = 250;
            instance.UpdateSinCos();
        }

        for (let i = 0; i < 100; i++) {
            let instance = this.groundcover.CreateInstance(meshes.grass);
            instance.rotation = new Vec3(0, Math.random() * 360, 0);
            instance.color = new Color(0, 35, 15);
            instance.drawDistance = 50;
            instance.UpdateSinCos();
        }
    }

    public LogicTick(delta: number, camera: Camera) {
        this.clouds.LockToCamera(camera);
        this.objects.LockToCamera(camera);
        this.groundcover.LockToCamera(camera);


        let clouds = this.clouds.items;

        let cloudColor = new Color(220, 220, 240);
        let fogColor = new Color(0, 0, 20);
        for (let i = 0; i < clouds.length; i++) {
            let cloud = clouds[i];

            cloud.location.x += 5 * delta;
            const dist = camera.Distance(cloud.location);

            let f = Math.min(dist / this.clouds.radius, 1);
            Color.Mix(cloud.color, cloudColor, fogColor, f);
        }

        let grassColor = new Color(0, 30, 10);
        let groundColor = new Color(0, 40, 20);
        for (let i = 0; i < this.groundcover.items.length; i++) {
            let item = this.groundcover.items[i];

            const dist = camera.Distance(item.location);

            let f = Math.min(dist / this.groundcover.radius, 1);
            Color.Mix(item.color, grassColor, groundColor, f);
        }
    }
}