
import WireframeRender from "./WireframeRender.js"
import Vec3 from "./Vec3.js"
import Color from "./Color.js"
import Rectangle from "./Rectangle.js";
import MeshInstance from "./MeshInstance.js";
import Mesh from "./Mesh.js";

const KEY_UP = 38, KEY_LEFT = 37, KEY_DOWN = 40, KEY_RIGHT = 39, KEY_SHIFT = 16;
const KEY_W = 87, KEY_A = 65, KEY_S = 83, KEY_D = 68;

var canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = canvas.getContext("2d");
if (ctx == null)
  throw new Error();

let renderer = new WireframeRender(ctx);
let fpsDate = Date.now();
let timer = Date.now();
let timerRender = 0;
let timerSim = 0;
let dropmesh: Mesh[] = [];

let meshes_obj = Mesh.ParseOBJ(loadText("./assets/models.obj"));

let meshes = {
  cloud: meshes_obj.cloud,
  tower: meshes_obj.atc,
  house: meshes_obj.house,
  tree: meshes_obj.tree,
};

let angle = 0;
let k: boolean[] = []
let resulution = 2;
let lookMode = false;
renderer.camera.SetFOV(90);
renderer.setSize(canvas.width / resulution, canvas.height / resulution);
for (let i = 0; i < 256; i++)k[i] = false;
window.addEventListener("keydown", (e) => { k[e.keyCode] = true; /*console.log(e.keyCode);*/ });
window.addEventListener("keyup", (e) => { k[e.keyCode] = false });
window.addEventListener("mousedown", (e) => {
  if (lookMode === true) {
    document.exitPointerLock();
  }
  else {
    canvas.requestPointerLock();
  }
});
document.addEventListener("pointerlockchange", (e) => {
  lookMode = !lookMode;
});
window.addEventListener("mousemove", (e) => {
  if (lookMode === true) {
    renderer.camera.RotateByMouse(e.movementX * 0.1, e.movementY * 0.1)
  }
});
window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  renderer.viewport = new Rectangle(0, 0, canvas.width, canvas.height);
  renderer.setSize(canvas.width / resulution, canvas.height / resulution);

  ctx.imageSmoothingEnabled = false;
}
window.onresize(null!);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e)=>{
      e.preventDefault();
      e.stopPropagation();
    });
});
window.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  if (dt == null)
    return;
  const files = dt.files;
  if (files.length > 0) {
    const file = files[0];
    readFile(file);
  }
});
function readFile(file: File) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target?.result;
    try {
      dropmesh = []
      var drop = Mesh.ParseOBJ(text as string);
      for (let key in drop) {
        dropmesh.push(drop[key])
      }
    }
    catch (e) {
      dropmesh = []
      alert(e);
    }
  }
  reader.readAsText(file);
}



function loadText(path: string): string {
  let request = new XMLHttpRequest();
  request.open("GET", path, false);
  request.send(null)
  return request.responseText;
}

function updateCam() {
  let camera = renderer.camera;
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
let clouds: MeshInstance[] = []
let objects: MeshInstance[] = [];

for (let i = 0; i < 600; i++) {
  clouds.push({
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
  objects.push({
    model: meshes.tree,
    center: new Vec3(0, 0, 0),
    rotation: new Vec3(Math.random() * 5 / 180 * Math.PI, Math.random() * 360 / 180 * Math.PI, Math.random() * 0),
    location: new Vec3(Math.random() * 10000 - 5000, 0, Math.random() * 10000 - 5000),
    color: new Color(Math.random() * 50, Math.random() * 50 + 50, Math.random()),
    scale: 5*(Math.random() + 1),
    drawDistance: 2500*(Math.random() + 1),
  })
}

for (let i = 0; i < 20; i++) {
  objects.push({
    model: meshes.house,
    center: new Vec3(0, 0, 0),
    rotation: new Vec3(0, Math.random() * 360, 0),
    location: new Vec3(Math.random() * 10000 - 5000, 0, Math.random() * 10000 - 5000),
    color: new Color(Math.random() * 20 + 90, Math.random() * 20 + 90, Math.random() * 20 + 90),
    scale: 10,
    drawDistance: 2500,
  })
}

function updateSim() {
  for (let i = 0; i < clouds.length; i++) {
    let cloud = clouds[i];

    cloud.location.x += 0.5;
    lockToCamera(cloud.location, 10000);

    const dist = renderer.camera.Distance(cloud.location);

    let f = (1 - Math.min(dist / 10000, 1)) * 220;
    cloud.color.r = f;
    cloud.color.g = f;
    cloud.color.b = f + 20;
  }

  for (let i = 0; i < objects.length;i++){
    let obj = objects[i];
    lockToCamera(obj.location, 5000);
  }
}

function lockToCamera(pos:Vec3, radius: number){
  let cpos = renderer.camera.position;

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

function render() {
  renderer.startScene(); {

    renderer.color = new Color(100, 100, 100);
    renderer.drawMesh(meshes.house, new Vec3(0, 0, 0), new Vec3(0, 66, 0), new Vec3(-18, 0, 47), 10);
    //renderer.drawMesh(meshes.runway, new Vec3(0, 0, 0), new Vec3(0, -25, 0), new Vec3(500, 0, 270));
    renderer.drawMesh(meshes.tower, new Vec3(0, 0, 0), new Vec3(0, -15, 0), new Vec3(70, 0, 157), 10);

    for (let i = 0; i < objects.length; i++) {
      renderer.drawMeshInstance(objects[i]);
    }

    for (let i = 0; i < clouds.length; i++) {
      renderer.drawMeshInstance(clouds[i]);
    }

    renderer.color = new Color(0, 255, 0);
    for (let i = 0; i < dropmesh.length; i++) {
      let mesh = dropmesh[i];
      renderer.drawMesh(mesh, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(0, mesh.size * 10, 0), 10);
    }

    renderer.color = new Color(0, 0, 255);
    //renderer.drawMesh(meshes.plane, new Vec3(0, 0, 0), new Vec3(-2, -25, 0), new Vec3(-200, -50, -1270));
    //renderer.drawMesh(meshes.plane, new Vec3(0, 0, 0), new Vec3(-2, -100, 0), new Vec3(14200, 3000, 24270));

  }
  //ctx.imageSmoothingEnabled = false;
  renderer.endScene();

  if (ctx == null)
    throw new Error();

  ctx.strokeStyle = "#0f0";
  ctx.font = "12px consolas ";
  ctx.strokeText("FPS = " + ((1000 / (Date.now() - fpsDate)) | 0), 10, 12, 200);
  ctx.strokeText("time = " + (((Date.now() - fpsDate) | 0) - 10) + "ms", 10, 12 * 2, 200);
  //ctx.strokeText("speedY = " + (planeSpeed.y / 100) + "m/s", 10, 12 * 3, 200);
  fpsDate = Date.now();
}
function main() {
  let time = Date.now() - timer;
  timer = Date.now()
  timerSim += time;
  timerRender += time;
  while (timerSim > 10) {
    timerSim -= 10;
    updateCam();
    updateSim();
    angle -= 0.001;
  }
  if (timerRender > 10) {
    timerRender = 0;
    render();
  }
  setTimeout(main, 5);
}

main();