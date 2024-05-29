import MeshInstance from "../MeshInstance.js";
import Vec3 from "../Vec3.js";
import Color from "../Color.js";
import SceneLayer from "./SceneLayer.js";
export default class Scene {
    constructor() {
        this.clouds = new SceneLayer(10000);
        this.objects = new SceneLayer(5000);
        this.groundcover = new SceneLayer(500);
    }
    Setup(meshes) {
        for (let i = 0; i < 600; i++) {
            let instance = new MeshInstance(meshes.cloud);
            instance.rotation = new Vec3(Math.random() * 5 / 180 * Math.PI, Math.random() * 360 / 180 * Math.PI, Math.random() * 0);
            instance.location = this.clouds.GetLocation();
            instance.location.y = Math.random() * 100 + 2000;
            instance.color = new Color(200, 200, 220);
            instance.scale = 10 * (Math.random() + 1);
            instance.drawDistance = 1E400;
            instance.UpdateSinCos();
            this.clouds.Push(instance);
        }
        for (let i = 0; i < 20000; i++) {
            let instance = new MeshInstance(meshes.tree);
            instance.rotation = new Vec3(Math.random() * 5 / 180 * Math.PI, Math.random() * 360 / 180 * Math.PI, Math.random() * 0);
            instance.location = this.objects.GetLocation();
            instance.color = new Color(Math.random() * 50, Math.random() * 50 + 50, Math.random());
            instance.scale = 5 * (Math.random() + 1);
            instance.drawDistance = 2500 * (Math.random() + 1);
            instance.UpdateSinCos();
            this.objects.Push(instance);
        }
        for (let i = 0; i < 20; i++) {
            let instance = new MeshInstance(meshes.house);
            instance.rotation = new Vec3(0, Math.random() * 360, 0);
            instance.location = this.objects.GetLocation();
            instance.color = new Color(Math.random() * 20 + 90, Math.random() * 20 + 90, Math.random() * 20 + 90);
            instance.scale = 10;
            instance.drawDistance = 2500;
            instance.UpdateSinCos();
            this.objects.Push(instance);
        }
        for (let i = 0; i < 100; i++) {
            let instance = new MeshInstance(meshes.grass);
            instance.rotation = new Vec3(0, Math.random() * 360, 0);
            instance.location = this.groundcover.GetLocation();
            instance.color = new Color(0, 35, 15);
            instance.scale = 10;
            instance.drawDistance = 500;
            instance.UpdateSinCos();
            this.groundcover.Push(instance);
        }
    }
    LogicTick(delta, camera) {
        this.clouds.LockToCamera(camera);
        this.objects.LockToCamera(camera);
        this.groundcover.LockToCamera(camera);
        let clouds = this.clouds.items;
        let cloudColor = new Color(220, 220, 240);
        let fogColor = new Color(0, 0, 20);
        for (let i = 0; i < clouds.length; i++) {
            let cloud = clouds[i];
            cloud.location.x += 50 * delta;
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
