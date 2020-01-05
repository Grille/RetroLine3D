
"use strict";

class Vec2 {
  constructor(p1, p2, p3) {
    this.x = p1;
    this.y = p2;
  }
}
class Vec3 {
  constructor(p1 = 0, p2 = 0, p3 = 0) {
    if (typeof p1 == 'object') {
      this.x = p1.x;
      this.y = p1.y;
      this.z = p1.z;
    }
    else {
      this.x = p1;
      this.y = p2;
      this.z = p3;
    }
  }
  add(p1, p2, p3) {
    if (typeof p1 == 'object') {
      this.x += p1.x;
      this.y += p1.y;
      this.z += p1.z;
    }
    else {
      this.x += p1;
      this.y += p2;
      this.z += p3;
    }
  }
  sub(p1, p2, p3) {
    if (typeof p1 == 'object') {
      this.x -= p1.x;
      this.y -= p1.y;
      this.z -= p1.z;
    }
    else {
      this.x -= p1;
      this.y -= p2;
      this.z -= p3;
    }
  }
  mul(p1, p2, p3) {
    if (typeof p1 == 'object') {
      this.x *= p1.x;
      this.y *= p1.y;
      this.z *= p1.z;
    }
    else {
      this.x *= p1;
      this.y *= p2;
      this.z *= p3;
    }
  }
  div(p1, p2, p3) {
    if (typeof p1 == 'object') {
      this.x /= p1.x;
      this.y /= p1.y;
      this.z /= p1.z;
    }
    else {
      this.x /= p1;
      this.y /= p2;
      this.z /= p3;
    }
  }
}

class WireframeRender {
  constructor(ctx) {
    this.dstCtx = ctx;
    this.dstCanvas = ctx.canvas;
    this.resolutionFactor = 1;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    this.setSize(this.dstCanvas.width, this.dstCanvas.height);
    this.setViewport(0, 0, this.width, this.height);

    this.ctx.lineWidth = 1 / this.resolutionFactor;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.miterLimit = 100;

    this.camPos = new Vec3(-380, -623, 2230)
    this.camRot = new Vec3(341, 347, 0);
    this.camSin = new Vec3(0, 0, 0);
    this.camCos = new Vec3(0, 0, 0);

    this.depthBuffer = new Uint8Array(0);
    this.colorBuffer = new Uint8Array(0);

  }
  //region private
  //resize canvas and use resolution
  setSize(width, height) {
    /*
    this.canvas.style.width = "" + window.innerWidth + "px";
    this.canvas.style.height = "" + window.innerHeight + "px";
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.width = (window.innerWidth / this.resolutionFactor) | 0;
    this.canvas.height = (window.innerHeight / this.resolutionFactor) | 0;
    */
    this.depthBuffer = new Uint8Array(width * height);
    this.colorBuffer = new Uint8Array(width * height * 3);

    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    this.screenDist = this.height;
  }

  setFOV(fov) {

  }

  setViewport(x, y, width, height) {
    this.viewport = { x, y, width, height };
  }
  //transforms vertex of an object
  transformVertex(point3D, center, sin, cos, translate) {

    let p = new Vec3(point3D)
    let b1, b2;

    p.sub(center);
    // X
    b1 = p.y; b2 = p.z;
    p.y = b1 * cos.x - b2 * sin.x;
    p.z = b2 * cos.x + b1 * sin.x;
    //Y
    b1 = p.x; b2 = p.z;
    p.x = b1 * cos.y - b2 * sin.y;
    p.z = b2 * cos.y + b1 * sin.y;
    // Z
    b1 = p.x; b2 = p.y;
    p.x = b1 * cos.z - b2 * sin.z;
    p.y = b2 * cos.z + b1 * sin.z;
    // Translate
    p.x += center.x; p.y += center.y; p.z += center.z;
    p.x += translate.x; p.y += translate.y; p.z += translate.z;

    //if (p.y<0)p.y=0;
    return p;
  }
  //transform vertex relative to camera
  transformCamPoint(point3D) {
    let p = new Vec3(point3D);
    let b1, b2;
    let { camPos, camCos, camSin } = this;
    // Y

    p.x += camPos.x; p.y += camPos.y; p.z += camPos.z;
    b1 = p.x; b2 = p.z;
    p.x = b1 * camCos.y - b2 * camSin.y
    p.z = b2 * camCos.y + b1 * camSin.y
    // X
    b1 = p.y; b2 = p.z;
    p.y = b1 * camCos.x - b2 * camSin.x;
    p.z = b2 * camCos.x + b1 * camSin.x
    // // Z
    b1 = p.x; b2 = p.y;
    p.x = b1 * camCos.z - b2 * camSin.z
    p.y = b2 * camCos.z + b1 * camSin.z

    return p;
  }
  //projection matrix, transform vertex into 2d point
  projectPoint(point3D, refPoint3D) {

    let min = -this.screenDist;
    let c = min;
    min *= 0.9;

    let p = this.transformCamPoint(point3D);
    p.z += min;

    let distZ, distX, distY;
    let m;
    let out = 0;

    if (p.z < min) {

      let rp = this.transformCamPoint(refPoint3D);
      rp.z += min;

      if (rp.z < min) return [0, 0, 1];

      distZ = p.z - rp.z;
      distX = p.x - rp.x;
      distY = p.y - rp.y;

      p.z = min;

      m = distX / distZ;
      p.x = rp.x + m * (p.z - rp.z);

      m = distY / distZ;
      p.y = rp.y + m * (p.z - rp.z);


      out = 1;
    }



    distZ = c - p.z;
    distX = -p.x;
    distY = -p.y;

    // get X
    m = distX / distZ;
    let x = m * (0 + c);

    // get Y
    m = distY / distZ;
    let y = m * (0 + c);

    let hwidth = this.width / 2, hheight = this.height / 2;

    //m = distX / distY;
    //if (x < -hwidth) x = m*-hwidth+x;

    let point2D = new Vec3((-x + hwidth), (y + hheight), p.z);

    /*
    {
      if (point2D.y < 0) point2D.y = 0;
      if (point2D.y > this.height) point2D.y = this.height;
    }
    */

    if (point2D.x > 0) out = 1;

    return point2D;
  }
  //test whether object in sight and near enough
  objectVisible(location, model) {

    let size = model.size;
    let min = -this.screenDist;
    let c = min;
    min *= 0.9;

    let p = this.transformCamPoint(location);
    p.z += size
    if (p.z < -size) return false;
    if (p.z > model.renderDist + size) return false;

    p.z += min;

    let distZ, distX, distY, m;
    let out = 0;

    distZ = c - p.z;
    let x, y;

    // test X
    m = (-p.x - size) / distZ;
    x = -m * (0 + c);
    if (x < -this.width / 2) return false;
    m = (-p.x + size) / distZ;
    x = -m * (0 + c);
    if (x > this.width / 2) return false;

    // test Y
    m = (-p.y - size) / distZ;
    y = -m * (0 + c);
    if (y < -this.height / 2) return false;
    m = (-p.y + size) / distZ;
    y = -m * (0 + c);
    if (y > this.height / 2) return false;

    return true;
  }
  //endregion

  //region public
  //Project a group of vertices and draw the lines between them
  drawObject(model, center, rotate, translate) {

    if (!this.objectVisible(translate, model)) return;

    //let totalPos = transformCamPoint(translate);
    // if (totalPos.z<0)return;
    // if (totalPos.z>1000)return;

    // totalPos = projectPoint(translate);
    // if (totalPos.x<0)return;

    let sin = new Vec3(0, 0, 0); let cos = new Vec3(1, 1, 1);
    if (rotate.x !== 0) {
      sin.x = Math.sin(rotate.x * 3.14159265 / 180);
      cos.x = Math.cos(rotate.x * 3.14159265 / 180);
    }
    if (rotate.y !== 0) {
      sin.y = Math.sin(rotate.y * 3.14159265 / 180);
      cos.y = Math.cos(rotate.y * 3.14159265 / 180);
    }
    if (rotate.z !== 0) {
      sin.z = Math.sin(rotate.z * 3.14159265 / 180);
      cos.z = Math.cos(rotate.z * 3.14159265 / 180);
    }

    let vertex = model.vertex;
    for (let io = 0; io < model.lines.length; io++) {
      let line = model.lines[io]
      if (line[0] === 0) {
        for (let i = 0; i < (line.length - 1) / 2; i++) {
          let vp = line[i * 2 + 1] * 3
          let pointA = this.transformVertex(new Vec3(vertex[vp + 0], vertex[vp + 1], vertex[vp + 2]), center, sin, cos, translate);
          vp = line[i * 2 + 2] * 3
          let pointB = this.transformVertex(new Vec3(vertex[vp + 0], vertex[vp + 1], vertex[vp + 2]), center, sin, cos, translate);
          this.drawLine(pointA, pointB);
        }
      }
      else if (line[0] === 1) {
        for (let i = 0; i < (line.length) - 2; i++) {
          let vp = line[i + 1] * 3
          let pointA = this.transformVertex(new Vec3(vertex[vp + 0], vertex[vp + 1], vertex[vp + 2]), center, sin, cos, translate);
          vp = line[i + 2] * 3
          let pointB = this.transformVertex(new Vec3(vertex[vp + 0], vertex[vp + 1], vertex[vp + 2]), center, sin, cos, translate);
          this.drawLine(pointA, pointB);
        }
      }
      else if (line[0] === 2) {
        let vp = line[1] * 3
        let pointA = this.transformVertex(new Vec3(vertex[vp + 0], vertex[vp + 1], vertex[vp + 2]), center, sin, cos, translate);
        for (let i = 0; i < (line.length) - 2; i++) {
          vp = line[i + 2] * 3
          let pointB = this.transformVertex(new Vec3(vertex[vp + 0], vertex[vp + 1], vertex[vp + 2]), center, sin, cos, translate);
          this.drawLine(pointA, pointB);
        }

      }
    }
  }
  //Project two vertices and draw a line between them
  lerp(s, e, t) {
    return s + t * (e - s);
  }
  drawLine(start3D, end3D){
    let start = this.projectPoint(start3D, end3D)
    let end = this.projectPoint(end3D, start3D)
    
    if (start.x === end.x && start.y === end.y) return;

    /*
    let dist = Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y));

    //console.log(dist);
    
    for (let step = 0; step < dist; step++) {
      let t = step / dist;
      let x = this.lerp(start.x, end.x, t);
      let y = this.lerp(start.y, end.y, t);
      let z = this.lerp(start.z, end.z, t);
      let index = x + y * this.width;
    }
    */
    this.ctx.moveTo(start.x | 0, start.y | 0);
    this.ctx.lineTo(end.x | 0, end.y | 0);
  }
  
  /*
  drawLine(start3D, end3D) {
    let tstart2D = this.projectPoint(start3D, end3D)
    let tend2D = this.projectPoint(end3D, start3D)
    //if (tstart2D.z === 1 && tend2D.z === 1) return;
    this.ctx.moveTo(tstart2D.x | 0, tstart2D.y | 0);
    this.ctx.lineTo(tend2D.x | 0, tend2D.y | 0);
    //console.log(tstart2D,tend2D);
  }
  */

  startScene(width, height) {
    this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "#fff";
    this.ctx.beginPath();
  }
  endScene() {
    this.ctx.stroke();
    this.dstCtx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
  }
}
//endregion
