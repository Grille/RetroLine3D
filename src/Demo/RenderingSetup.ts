import Camera from "../Camera.js";
import WireframeRenderer from "../WireframeRenderer.js";
import Rectangle from "../Rectangle.js";
import Scene from "./Scene.js";
import Mesh from "../Mesh.js";
import Vec3 from "../Vec3.js";
import Color from "../Color.js";
import SceneLayer from "./SceneLayer.js";
import MeshInstance from "../MeshInstance.js";

const KEY_SHIFT = 16;
const Key_CTRL = 17;
const Key_ALT = 18;
const KEY_UP = 38, KEY_LEFT = 37, KEY_DOWN = 40, KEY_RIGHT = 39;
const KEY_W = 87, KEY_A = 65, KEY_S = 83, KEY_D = 68, KEY_H = 72;

export default class RenderingSetup {

    public canvas: HTMLCanvasElement;
    public infobox: HTMLDivElement;
    public debugbox: HTMLDivElement;
    public ctx: CanvasRenderingContext2D
    public keyDown: boolean[]
    public renderer: WireframeRenderer;
    public camera: Camera;
    public cameraRestricted: boolean;
    public cameraSpeed: number;
    public resolution: number;

    private lookMode: boolean = false;

    constructor() {
        this.infobox = document.getElementById("info") as HTMLDivElement;
        this.debugbox = document.getElementById("debug") as HTMLDivElement;

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        if (this.ctx == null)
            throw new Error("Could not get canvas rendering context.");

        this.renderer = new WireframeRenderer(this.ctx);
        this.camera = this.renderer.camera;
        this.resolution = 0.5;

        this.camera.position.y = 10;
        this.cameraSpeed = 32;
        this.cameraRestricted = true;

        this.keyDown = []

        this.RegisterKeyEvents();
        this.RegisterCameraEvents();
        this.RegisterResizeEvents();
    }

    private RegisterResizeEvents() {
        this.canvas.onwheel = (e) => {
            let delta = e.deltaY;
            if (!this.keyDown[KEY_SHIFT]) {
                if (delta > 0) {
                    this.cameraSpeed *= 0.5;
                }
                else {
                    this.cameraSpeed /= 0.5;
                }

                const max = 4096;
                const min = 0.0625;

                if (this.cameraSpeed > max) {
                    this.cameraSpeed = max;
                }
                if (this.cameraSpeed < min) {
                    this.cameraSpeed = min;
                }
            }
            else {
                if (delta > 0) {
                    this.resolution *= 0.5;
                }
                else {
                    this.resolution /= 0.5;
                }

                const max = 8;
                const min = 0.0625;

                if (this.resolution > max) {
                    this.resolution = max;
                }
                if (this.resolution < min) {
                    this.resolution = min;
                }

                this.UpdateViewport();
            }
        }
        window.onresize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            this.UpdateViewport();

            this.ctx.imageSmoothingEnabled = false;
        }
        window.onresize(null!);
    }

    private UpdateViewport() {
        this.renderer.viewport = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
        this.renderer.SetSize(this.canvas.width * this.resolution, this.canvas.height * this.resolution);
    }

    private RegisterKeyEvents() {
        window.addEventListener("keydown", (e) => {
            this.keyDown[e.keyCode] = true;
            if (this.keyDown[KEY_H]){
                this.infobox.hidden = !this.infobox.hidden;
            }
        });
        window.addEventListener("keyup", (e) => {
            this.keyDown[e.keyCode] = false
        });
    }

    private RegisterCameraEvents() {
        this.canvas.addEventListener("mousedown", (e) => {
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
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.lookMode === true) {
                this.camera.RotateByMouse(e.movementX * 0.1, e.movementY * 0.1)
            }
        });
    }

    public LogicTick(delta: number) {
        let k = this.keyDown;
        let camera = this.camera;
        let inputs = camera.inputs;

        inputs.moveLeft = k[KEY_LEFT] || k[KEY_A];
        inputs.moveUp = k[KEY_UP] || k[KEY_W];
        inputs.moveRight = k[KEY_RIGHT] || k[KEY_D];
        inputs.moveDown = k[KEY_DOWN] || k[KEY_S];

        inputs.speed = this.cameraSpeed * delta;

        camera.Update();

        if (this.cameraRestricted) {
            if (camera.position.y < 0) {
                camera.position.y = 0;
            }
            if (camera.position.y > 500) {
                camera.position.y = 500;
            }
        }
    }

    public Begin(){
        this.renderer.StartScene();
    }

    public End(){
        this.renderer.EndScene();

        let debuginfo = this.renderer.diagnostics;
        let cpos = this.camera.position;
        this.debugbox.innerText = `
        Info:
        - Position <${cpos.x|0},${cpos.y|0},${cpos.z|0}>
        - Speed ${this.cameraSpeed}m/s

        Performance:
        - fps ${debuginfo.loggedFpsCount}
        - delta ${debuginfo.loggedDelta}ms
        - resolution x${this.resolution} <${this.renderer.width},${this.renderer.height}>px

        Draw Calls:
        - objects ${debuginfo.objectDrawCalls}
        - - executed ${debuginfo.objectDrawCalls - debuginfo.objectDrawCallsDiscarded}
        - - discarded ${debuginfo.objectDrawCallsDiscarded}
        - lines ${debuginfo.lineDrawCalls}
        - - executed ${debuginfo.lineDrawCalls - debuginfo.lineDrawCallsDiscarded}
        - - discarded ${debuginfo.lineDrawCallsDiscarded}
        `
    }

    public RenderScene(scene: Scene) {
        this.DrawSceneLayer(scene.clouds);
        this.DrawSceneLayer(scene.objects);
        this.DrawSceneLayer(scene.groundcover);
    }

    DrawSceneLayer(layer: SceneLayer){
        let items = layer.items;
        let renderer = this.renderer;
        for (let i = 0; i < items.length; i++) {
            renderer.DrawMesh(items[i]);
        }
    }

    public RenderMeshes(meshes: Mesh[], color: Color){
        let renderer = this.renderer;

        renderer.color = color;
        for (let i = 0; i < meshes.length; i++) {
          let mesh = meshes[i];

          let instance = new MeshInstance(mesh);
          instance.color = color;
          instance.scale = 10;

          renderer.DrawMesh(instance);
        }
    }
}