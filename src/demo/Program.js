import RenderingSetup from "./RenderingSetup.js";
import Meshes from "./Meshes.js";
import Scene from "./Scene.js";
import Color from "../Color.js";
const COLOR_LIME = new Color(0, 255, 0);
let rendering = new RenderingSetup();
let meshes = new Meshes();
let scene = new Scene();
scene.Setup(meshes);
let date = Date.now();
function LogicTick() {
    let now = Date.now();
    let delta = (now - date) / 1000;
    date = now;
    rendering.LogicTick(delta);
    scene.LogicTick(delta, rendering.camera);
}
function RenderTick() {
    rendering.Begin();
    rendering.RenderScene(scene);
    rendering.RenderMeshes(meshes.userdrop, COLOR_LIME);
    rendering.End();
}
function Tick() {
    LogicTick();
    RenderTick();
    requestAnimationFrame(Tick);
}
Tick();
