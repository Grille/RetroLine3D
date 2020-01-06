"use strict";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let renderer = new WireframeRender(ctx);
let planePos = new Vec3(-200, 100, -1270);
let planeRot = new Vec3(0, -25, 0);
let planeRotSpeed = new Vec3(0, 0, 0);
let planeSpeed = new Vec3(0, 0, 0);
let fpsDate = Date.now();
let data;
let request = new XMLHttpRequest();
let timer = Date.now();
let timerRender = 0;
let timerSim = 0;
request.open("GET", "./example/models.json", false);
request.send(null)
data = JSON.parse(request.responseText);
let angle = 0;
let lastMousePos = [0, 0];
let k = []
let resulution = 2;
renderer.setFOV(45);
renderer.setSize(canvas.width / resulution, canvas.height / resulution);
for (let i = 0; i < 256; i++)k[i] = 0;
window.addEventListener("keydown", (e) => { k[e.keyCode] = 1; console.log(e.keyCode); });
window.addEventListener("keyup", (e) => { k[e.keyCode] = 0 });
window.addEventListener("mousemove", (e) => {
  if (e.buttons === 1) {
    let { camRot } = renderer;
    camRot.x -= e.movementY / 2;
    camRot.y += e.movementX / 2;
    lastMousePos = [e.clientX, e.clientY];
  }
});
window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  renderer.setViewport(0, 0, canvas.width, canvas.height);
  renderer.setSize(canvas.width / resulution, canvas.height / resulution);
  ctx.imageSmoothingEnabled = false;
}

function updateCam() {

  //if (camRot.x <= 90) camRot.x = 0;
  //if (camRot.x < 180) camRot.x = 180;

  let { camRot, camSin, camCos, camPos } = renderer;
  if (camRot.y >= 360) camRot.y -= 360;
  if (camRot.y < 0) camRot.y += 360;

  if (camRot.z >= 360) camRot.z -= 360;
  if (camRot.z < 0) camRot.z += 360;

  camSin.x = Math.sin(camRot.x * 3.14159265 / 180), camCos.x = Math.cos(camRot.x * 3.14159265 / 180);
  camSin.y = Math.sin(camRot.y * 3.14159265 / 180), camCos.y = Math.cos(camRot.y * 3.14159265 / 180);
  camSin.z = Math.sin(camRot.z * 3.14159265 / 180), camCos.z = Math.cos(camRot.z * 3.14159265 / 180);
  if (k[37] === 1 || k[38] === 1 || k[39] === 1 || k[40] === 1) {

    let speed = 8;
    if (k[16] === 1) speed *= 8;

    //Y
    let yv = camRot.x / 180;
    if (yv > 1) yv = 1 - (yv - 1);
    if (yv < 0.5) yv = 1 - (1 - yv * 2);
    else yv = 1 - ((yv - 0.5) * 2);
    if (camRot.x > 180) yv = -yv;
    if (k[38] === 1) camPos.y -= yv * speed;
    else if (k[40] === 1) camPos.y += yv * speed;
    if (yv < 0) yv = -yv; yv = 1 - yv;
    // Z
    let zv = camRot.y / 180;
    if (zv > 1) zv = 1 - (zv - 1);
    if (zv < 0.5) zv = 1 - zv * 2;
    else zv = (1 - zv - 0.5) * 2;
    if (k[38] === 1) camPos.z -= (zv * speed) * yv;
    else if (k[40] === 1) camPos.z += (zv * speed) * yv;
    if (k[39] === 1) camPos.x -= zv * speed;
    else if (k[37] === 1) camPos.x += zv * speed;

    //X
    let xv = camRot.y / 180;
    if (xv > 1) xv = 1 - (xv - 1);
    if (xv < 0.5) xv = 1 - (1 - xv * 2);
    else xv = 1 - ((xv - 0.5) * 2);
    if (camRot.y > 180) xv = -xv;
    if (k[38] === 1) camPos.x -= (xv * speed) * yv;
    else if (k[40] === 1) camPos.x += (xv * speed) * yv;
    if (k[39] === 1) camPos.z += xv * speed;
    else if (k[37] === 1) camPos.z -= xv * speed;

  }


}
let objects = [];
for (let i = 0; i < 10000; i++) {
  objects.push({
    model: data.tree,
    center: new Vec3(0, 0, 0),
    rotation: new Vec3(Math.random() * 10, Math.random() * 360, Math.random() * 10),
    location: new Vec3(Math.random() * 100000 - 50000, 0, Math.random() * 100000 - 50000),
    color: { r: Math.random() * 50, g: Math.random() * 50 + 50, b: Math.random(50) },
  })
}
for (let i = 0; i < 20; i++) {
  objects.push({
    model: data.house,
    center: new Vec3(0, 0, 0),
    rotation: new Vec3(0, Math.random() * 360, 0),
    location: new Vec3(Math.random() * 100000 - 50000, 0, Math.random() * 100000 - 50000),
    color: { r: Math.random() * 20 + 90, g: Math.random() * 20 + 90, b: Math.random() * 20 + 90 },
  })
}
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderer.startScene(); {

    
    let size = 100000
    
    for (let i = -size; i <= size; i += 1000) {
      if (i % 10000 === 0)
        renderer.color = { r: 25, g: 75, b: 0 };
      else
        renderer.color = { r: 10, g: 25, b: 0 };
      renderer.drawLine(new Vec3(i, -1, -size), new Vec3(i, -1, size));
      renderer.drawLine(new Vec3(-size, -1, i), new Vec3(size, -1, i));
    }

    for (let i = -size; i <= size; i += 10000) {
      if (i % 100000 === 0)
        renderer.color = { r: 255, g: 255, b: 255 };
      else
        renderer.color = { r: 100, g: 100, b: 255 };
      renderer.drawLine(new Vec3(i, 20000, -size), new Vec3(i, 20000, size));
      renderer.drawLine(new Vec3(-size, 20000, i), new Vec3(size, 20000, i));
    }

    renderer.color = {r:255,g:0,b:0};
    renderer.drawObject(data.cube, new Vec3(0, 0, 0), new Vec3(angle * 2, angle, 0), new Vec3(0, 0, 0));

    renderer.color = {r:100,g:100,b:100};
    renderer.drawObject(data.house, new Vec3(0, 0, 0), new Vec3(0, 66, 0), new Vec3(-180, 0, 470));
    renderer.drawObject(data.runway, new Vec3(0, 0, 0), new Vec3(0, -25, 0), new Vec3(500, 0, 270));
    renderer.drawObject(data.tower, new Vec3(0, 0, 0), new Vec3(0, -15, 0), new Vec3(700, 0, 1570));

    for (let i = 0;i<objects.length;i++){
      renderer.color = objects[i].color;
      renderer.drawObject(objects[i].model, objects[i].center, objects[i].rotation, objects[i].location);
    }

    renderer.color = {r:0,g:0,b:255};
    renderer.drawObject(data.plane, new Vec3(0, 0, 0), new Vec3(-2, -25, 0), new Vec3(-200, -50, -1270));
    renderer.drawObject(data.plane, new Vec3(0, 0, 0), new Vec3(-2, -100, 0), new Vec3(14200, 3000, 24270));

  }
  //ctx.imageSmoothingEnabled = false;
  renderer.endScene();

  ctx.strokeStyle = "#0f0";
  ctx.font = "12px consolas ";
  ctx.strokeText("FPS = " + ((1000 / (Date.now() - fpsDate)) | 0), 10, 12, 200);
  ctx.strokeText("time = " + (((Date.now() - fpsDate) | 0) - 10) + "ms", 10, 12 * 2, 200);
  ctx.strokeText("speedY = " + (planeSpeed.y / 100) + "m/s", 10, 12 * 3, 200);
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
    angle += 0.05;
  }
  if (timerRender > 10) {
    timerRender = 0;
    render();
  }
  setTimeout(main, 5);
}
