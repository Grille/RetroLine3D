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
  renderer.setSize(canvas.width / 2, canvas.height / 2);
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
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderer.startScene(); {

    let size = 40000
    for (let i = -size; i < size; i += 1000) {
      renderer.drawLine(new Vec3(i, 0, -size), new Vec3(i, 0, size));
      renderer.drawLine(new Vec3(-size, 0, i), new Vec3(size, 0, i));
    }

    for (let i = -size; i < size; i += 10000) {
      renderer.drawLine(new Vec3(i, 0, -size), new Vec3(i, 0, size));
      renderer.drawLine(new Vec3(-size, 0, i), new Vec3(size, 0, i));
    }

    renderer.drawLine(new Vec3(0, 0, -size), new Vec3(0, 0, size));
    renderer.drawLine(new Vec3(-size, 0, 0), new Vec3(size, 0, 0));



    renderer.drawObject(data.cube, new Vec3(0, 0, 0), new Vec3(angle * 2, angle, 0), new Vec3(0, 0, 0));

    renderer.drawObject(data.house, new Vec3(0, 0, 0), new Vec3(0, 66, 0), new Vec3(-180, 0, 470));
    renderer.drawObject(data.runway, new Vec3(0, 0, 0), new Vec3(0, -25, 0), new Vec3(500, 0, 270));
    renderer.drawObject(data.tower, new Vec3(0, 0, 0), new Vec3(0, -15, 0), new Vec3(700, 0, 1570));

    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(100, 0, 100));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(150, 0, 210));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(180, 0, 270));

    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(665, 0, -234));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-34, 0, -346));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-457, 0, 654));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-576, 0, -99));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(456, 0, -523));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-123, 0, 270));

    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(6650, 0, -2340));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-340, 0, -3460));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-4570, 0, 6540));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-5760, 0, -990));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(4560, 0, -5230));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-1230, 0, 2700));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(6650, 0, -2340));

    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-3040, 0, -30460));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-5070, 0, 540));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-760, 0, -9900));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(5600, 0, -2300));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-10230, 0, 27000));

    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(6650, 0, -23040));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-3040, 0, 34060));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-35070, 0, 6540));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(30760, 0, -990));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(39060, 0, -12030));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-12030, 0, 27000));
    renderer.drawObject(data.tree, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(-30650, 0, -2340));

    renderer.drawObject(data.plane, new Vec3(0, 0, 0), new Vec3(-2, -25, 0), new Vec3(-200, -50, -1270));

  }
  ctx.imageSmoothingEnabled = false;
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
    angle += 0.5;
  }
  if (timerRender > 10) {
    timerRender = 0;
    render();
  }
  setTimeout(main, 5);
}
