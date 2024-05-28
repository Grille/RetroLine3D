import RenderingSetup from "./Page.js";
import Meshes from "./Meshes.js";
import Scene from "./Scene.js";
import Color from "../Color.js";
const COLOR_LIME = new Color(0, 255, 0);
let rendering = new RenderingSetup();
let meshes = new Meshes();
let scene = new Scene();
scene.Setup(meshes);
function LogicTick() {
    rendering.LogicTick();
    scene.LogicTick(rendering.camera);
}
function RenderTick() {
    rendering.Begin();
    rendering.RenderScene(scene);
    rendering.RenderMeshes(meshes.userdrop, COLOR_LIME);
    rendering.End();
}
setInterval(LogicTick, 10);
setInterval(RenderTick, 10);
