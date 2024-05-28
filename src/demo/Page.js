import WireframeRender from "../WireframeRender.js";
import Rectangle from "../Rectangle.js";
import Vec3 from "../Vec3.js";
const KEY_UP = 38, KEY_LEFT = 37, KEY_DOWN = 40, KEY_RIGHT = 39, KEY_SHIFT = 16;
const KEY_W = 87, KEY_A = 65, KEY_S = 83, KEY_D = 68;
export default class RenderingSetup {
    constructor() {
        this.lookMode = false;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        if (this.ctx == null)
            throw new Error("Could not get canvas rendering context.");
        this.renderer = new WireframeRender(this.ctx);
        this.camera = this.renderer.camera;
        this.keyDown = [];
        this.RegisterKeyEvents();
        this.RegisterCameraEvents();
        this.RegisterResizeEvents();
    }
    RegisterResizeEvents() {
        window.onresize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.renderer.viewport = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
            this.renderer.setSize(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.imageSmoothingEnabled = false;
        };
        window.onresize(null);
    }
    RegisterKeyEvents() {
        window.addEventListener("keydown", (e) => { this.keyDown[e.keyCode] = true; /*console.log(e.keyCode);*/ });
        window.addEventListener("keyup", (e) => { this.keyDown[e.keyCode] = false; });
    }
    RegisterCameraEvents() {
        window.addEventListener("mousedown", (e) => {
            if (this.lookMode === true) {
                document.exitPointerLock();
            }
            else {
                this.canvas.requestPointerLock();
            }
        });
        document.addEventListener("pointerlockchange", (e) => {
            this.lookMode = !this.lookMode;
        });
        window.addEventListener("mousemove", (e) => {
            if (this.lookMode === true) {
                this.camera.RotateByMouse(e.movementX * 0.1, e.movementY * 0.1);
            }
        });
    }
    LogicTick() {
        let k = this.keyDown;
        let camera = this.camera;
        let inputs = camera.inputs;
        inputs.moveLeft = k[KEY_LEFT] || k[KEY_A];
        inputs.moveUp = k[KEY_UP] || k[KEY_W];
        inputs.moveRight = k[KEY_RIGHT] || k[KEY_D];
        inputs.moveDown = k[KEY_DOWN] || k[KEY_S];
        if (k[KEY_SHIFT]) {
            inputs.speed = 8;
        }
        else {
            inputs.speed = 1;
        }
        camera.Update();
    }
    Begin() {
        this.renderer.startScene();
    }
    End() {
        this.renderer.endScene();
    }
    RenderScene(scene) {
        let renderer = this.renderer;
        for (let i = 0; i < scene.objects.length; i++) {
            renderer.drawMeshInstance(scene.objects[i]);
        }
        for (let i = 0; i < scene.clouds.length; i++) {
            renderer.drawMeshInstance(scene.clouds[i]);
        }
    }
    RenderMeshes(meshes, color) {
        let renderer = this.renderer;
        renderer.color = color;
        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];
            renderer.drawMesh(mesh, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(0, mesh.size * 10, 0), 10);
        }
    }
}
