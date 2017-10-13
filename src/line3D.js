
"use strict";

let ctx;
let width=1024;let height=768;let resolutionFactor = 4;
resize(0);
let camPos = [-380, -623, 2230]
let camRot = [341, 347, 0];
let camSin = [0,0,0], camCos = [0,0,0];

window.addEventListener("resize",resize);
function resize(e) {
  canvas.style.width = ""+window.innerWidth+"px";
  canvas.style.height = ""+window.innerHeight+"px";
  canvas.style.imageRendering = "pixelated";
  canvas.width = (window.innerWidth/resolutionFactor)|0;
  canvas.height = (window.innerHeight/resolutionFactor)|0;
  width=canvas.width;height=canvas.height;
  ctx=canvas.getContext("2d");
  ctx.lineWidth = 1/resolutionFactor;
  ctx.imageSmoothingEnabled = false;
}
function transformVertex(point3D,center,sin,cos,translate) {
  
  let p = [point3D[0],point3D[1],point3D[2]]
  let b1,b2;

  p[0] += center[0];p[1] += center[1];p[2] += center[2];
  b1 = p[0];b2 = p[2];
  p[0] = b1 * cos[1] - b2 * sin[1]
  p[2] = b2 * cos[1] + b1 * sin[1]
  // X
  b1 = p[1];b2 = p[2];
  p[1] = b1 * cos[0] - b2 * sin[0];
  p[2] = b2 * cos[0] + b1 * sin[0]
  // // Z
  b1 = p[0];b2 = p[1];
  p[0] = b1 * cos[2] - b2 * sin[2]
  p[1] = b2 * cos[2] + b1 * sin[2]
  p[0] -= center[0];p[1] -= center[1];p[2] -= center[2];
  // Translate
  p[0] += translate[0];p[1] += translate[1];p[2] += translate[2];
  
  return p;
}
function transformCamPoint(point3D) {

  let p = [point3D[0],point3D[1],point3D[2]]
  let b1,b2;
  // Y
  p[0] += camPos[0];p[1] += camPos[1];p[2] += camPos[2];
  b1 = p[0];b2 = p[2];
  p[0] = b1 * camCos[1] - b2 * camSin[1]
  p[2] = b2 * camCos[1] + b1 * camSin[1]
  // X
  b1 = p[1];b2 = p[2];
  p[1] = b1 * camCos[0] - b2 * camSin[0];
  p[2] = b2 * camCos[0] + b1 * camSin[0]
  // // Z
  b1 = p[0];b2 = p[1];
  p[0] = b1 * camCos[2] - b2 * camSin[2]
  p[1] = b2 * camCos[2] + b1 * camSin[2]

  return p;
}
function projectPoint(point3D,refPoint3D){

  let min=-height;
  let c = min;
  min *=0.9;

  let p = transformCamPoint(point3D);
  p[2]+=min;

  let distZ,distX,distY;
  let m;
  let out = 0;
  
  if (p[2]<min){

    let rp = transformCamPoint(refPoint3D);
    rp[2]+=min;

    if (rp[2]<min) return [0,0,1];

    distZ = p[2]-rp[2];
    distX = p[0]-rp[0];
    distY = p[1]-rp[1];

    p[2]=min;

    m = distX / distZ;
    p[0]=rp[0]+m*(p[2]-rp[2]);

    m = distY / distZ;
    p[1]=rp[1]+m*(p[2]-rp[2]);


	  out = 1;
  }


  distZ = c-p[2];
  distX = -p[0];
  distY = -p[1];

  // get X
  m = distX / distZ;
  let x=m*(0+c);

  // get Y
  m = distY / distZ;
  let y=m*(0+c);

  let point2D = [(-x+width/2),(y+height/2),out];

  return point2D;
}
function drawObject(model,center,rotate,translate){

  let usedCenter = [-center[0],-center[1],-center[2]];
  let sin = [],cos = [];
  sin[0] = Math.sin(rotate[0] * 3.14159265 / 180), cos[0] = Math.cos(rotate[0] * 3.14159265 / 180);
  sin[1] = Math.sin(rotate[1] * 3.14159265 / 180), cos[1] = Math.cos(rotate[1] * 3.14159265 / 180);
  sin[2] = Math.sin(rotate[2] * 3.14159265 / 180), cos[2] = Math.cos(rotate[2] * 3.14159265 / 180);

  let vertex = model.vertex;
  for (let io = 0;io < model.lines.length;io++){
    let line = model.lines[io]
    if (line[0] === 0){
      for (let i = 0;i < (line.length-1)/2;i++){
        let vp = line[i*2+1]*3
        let pointA = transformVertex([vertex[vp+0],vertex[vp+1],vertex[vp+2]],usedCenter,sin,cos,translate);
        vp = line[i*2+2]*3
        let pointB = transformVertex([vertex[vp+0],vertex[vp+1],vertex[vp+2]],usedCenter,sin,cos,translate);
        drawLine(pointA, pointB);
      }
    }
    else if (line[0] === 1){
      for (let i = 0;i < (line.length)-2;i++){
        let vp = line[i+1]*3
        let pointA = transformVertex([vertex[vp+0],vertex[vp+1],vertex[vp+2]],usedCenter,sin,cos,translate);
        vp = line[i+2]*3
        let pointB = transformVertex([vertex[vp+0],vertex[vp+1],vertex[vp+2]],usedCenter,sin,cos,translate);
        drawLine(pointA, pointB);
      }
    }
    else if (line[0] === 2){
      let vp = line[1]*3
      let pointA = transformVertex([vertex[vp+0],vertex[vp+1],vertex[vp+2]],usedCenter,sin,cos,translate);
      for (let i = 0;i < (line.length)-2;i++){
        vp = line[i+2]*3
        let pointB = transformVertex([vertex[vp+0],vertex[vp+1],vertex[vp+2]],usedCenter,sin,cos,translate);
        let tstart2D = projectPoint(pointA,pointB)
        let tend2D = projectPoint(pointB,pointA)
        if (tstart2D[2] === 1 && tend2D[2] === 1) return;
        ctx.moveTo(tstart2D[0],tstart2D[1]);
        ctx.lineTo(tend2D[0],tend2D[1]);
      }
    }
  }
}
function drawLine(start3D,end3D){
  let tstart2D = projectPoint(start3D,end3D)
  let tend2D = projectPoint(end3D,start3D)
  if (tstart2D[2] === 1 && tend2D[2] === 1) return;
  ctx.moveTo(tstart2D[0],tstart2D[1]);
  ctx.lineTo(tend2D[0],tend2D[1]);
}

