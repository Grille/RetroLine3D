"use strict";

let date = Date.now();
let ctxGui = canvasGui.getContext("2d");
let data;
let request = new XMLHttpRequest();
request.open("GET", "./example/models.json", false);
request.send(null)
data = JSON.parse(request.responseText);
let angle = 0;
let lastMousePos = [0,0];
let k = []
for (let i = 0;i<256;i++)k[i]=0;
window.addEventListener("keydown",(e)=>{k[e.keyCode]=1;console.log(e.keyCode);});
window.addEventListener("keyup",(e)=>{k[e.keyCode]=0});
window.addEventListener("mousemove",(e) => {
  if (e.buttons === 1){
  camRot[0]-=e.movementY/2;
  camRot[1]+=e.movementX/2;
  lastMousePos = [e.clientX,e.clientY];
  }
});

function updateCam(){
  for (let i = 0;i<3;i++){
    if (camRot[i]>=360)camRot[i]-=360;
    if (camRot[i]<0)camRot[i]+=360;
  }
  camSin[0] = Math.sin(camRot[0] * 3.14159265 / 180), camCos[0] = Math.cos(camRot[0] * 3.14159265 / 180);
  camSin[1] = Math.sin(camRot[1] * 3.14159265 / 180), camCos[1] = Math.cos(camRot[1] * 3.14159265 / 180);
  camSin[2] = Math.sin(camRot[2] * 3.14159265 / 180), camCos[2] = Math.cos(camRot[2] * 3.14159265 / 180);
  if (k[37]===1||k[38]===1||k[39]===1||k[40]===1){

    let speed = 4;
    if (k[16]===1)speed*=4;

    //Y
    let yv = camRot[0]/180;
    if (yv > 1) yv =  1-(yv-1);
    if (yv < 0.5) yv = 1-(1-yv*2);
    else yv = 1-((yv-0.5)*2);
    if (camRot[0]>180)yv =-yv;
    if (k[38]===1) camPos[1]-=yv*speed;
    else if (k[40]===1) camPos[1]+=yv*speed;
    if (yv < 0) yv=-yv;yv = 1-yv;
    // Z
    let zv = camRot[1]/180;
    if (zv > 1) zv =  1-(zv-1);
    if (zv < 0.5) zv = 1-zv*2;
    else zv = (1-zv-0.5)*2;
    if (k[38]===1) camPos[2]-=(zv*speed)*yv;
    else if (k[40]===1) camPos[2]+=(zv*speed)*yv;
    if (k[39]===1) camPos[0]-=zv*speed;
    else if (k[37]===1) camPos[0]+=zv*speed;

    //X
    let xv = camRot[1]/180;
    if (xv > 1) xv =  1-(xv-1);
    if (xv < 0.5) xv = 1-(1-xv*2);
    else xv = 1-((xv-0.5)*2);
    if (camRot[1]>180)xv =-xv;
    if (k[38]===1) camPos[0]-=(xv*speed)*yv;
    else if (k[40]===1) camPos[0]+=(xv*speed)*yv;
    if (k[39]===1) camPos[2]+=xv*speed;
    else if (k[37]===1) camPos[2]-=xv*speed;

  }


}
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
    ctx.strokeStyle="#121";
    ctx.beginPath()
    let size = 40000
    for (let i = -size;i<size;i+=1000) {
      drawLine([i,0,-size],[i,0,size]);
    }
    for (let i = -size;i<size;i+=1000) {
      drawLine([-size,0,i],[size,0,i]);
    }
    ctx.stroke();
  
    ctx.strokeStyle="#454";
    ctx.beginPath()
    for (let i = -size;i<size;i+=10000) {
      drawLine([i,0,-size],[i,0,size]);
    }
    for (let i = -size;i<size;i+=10000) {
      drawLine([-size,0,i],[size,0,i]);
    }
  
    drawLine([0,0,-size],[0,0,size]);
    //drawLine([0,-size,0],[0,size,0]);
    drawLine([-size,0,0],[size,0,0]);
    ctx.stroke();
  
    ctx.strokeStyle="#cfc";
    ctx.beginPath()
  
    drawObject(data.cube,[0,0,0],[angle*2,angle,0],[0,50,0]);
  
    drawObject(data.tree,[0,0,0],[0,0,0],[100,0,100]);
    drawObject(data.tree,[0,0,0],[0,0,0],[150,0,210]);
    drawObject(data.tree,[0,0,0],[0,0,0],[180,0,270]);
  
    drawObject(data.house,[0,0,0],[0,66,0],[-180,0,470]);
    drawObject(data.runway,[0,0,0],[0,-25,0],[500,0,270]);
  
    drawObject(data.tree,[0,0,0],[0,0,0],[665,0,-234]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-34,0,-346]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-457,0,654]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-576,0,-99]);
    drawObject(data.tree,[0,0,0],[0,0,0],[456,0,-523]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-123,0,270]);
  
    drawObject(data.tree,[0,0,0],[0,0,0],[6650,0,-2340]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-340,0,-3460]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-4570,0,6540]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-5760,0,-990]);
    drawObject(data.tree,[0,0,0],[0,0,0],[4560,0,-5230]);
    drawObject(data.tree,[0,0,0],[0,0,0],[-1230,0,2700]);
  
  
    //drawObject(model,[0,0,0],[-angle,-angle*2,-angle*0.5],[0,0,0]);
    angle+=0.5;
    //drawPath(ship);
    
    // drawLine([50,0,-100],[0,0,300]);
    // drawLine([-50,0,-100],[0,0,300]);
    // drawLine([0,50,-100],[0,0,300]);
    // drawLine([0,-50,-100],[0,0,300]);
  
    ctx.stroke();
  
    ctxGui.clearRect(0,0,canvasGui.width,canvasGui.height);
    canvasGui.style.imageRendering = "pixelated";
    ctxGui.strokeStyle="#0f0";
    //ctxGui.font="16px consolas ";
    ctxGui.strokeText("FPS = "+((1000/(Date.now()-date))|0) ,10,12,100);
    ctxGui.strokeText("time = "+(((Date.now()-date)|0)-10) +"ms",10,12*2,100);
    date = Date.now();
}
function main(){
  updateCam()
  render()
  setTimeout(main,10);
}
