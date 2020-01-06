
"use strict";

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
}

class WireframeRender {
  constructor(ctx) {
    this.dstCtx = ctx;
    this.dstCanvas = ctx.canvas;
    this.resolutionFactor = 1;

    this.color = { r: 0, g: 255, b: 0 };
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.ctx.lineWidth = 1 / this.resolutionFactor;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.miterLimit = 100;

    this.camPos = new Vec3(-380, -623, 2230)
    this.camRot = new Vec3(341, 347, 0);
    this.camSin = new Vec3(0, 0, 0);
    this.camCos = new Vec3(0, 0, 0);

    this.depthBuffer = new Float32Array(0);
    this.colorBuffer = new Uint8ClampedArray(0);

    this.setSize(this.dstCanvas.width, this.dstCanvas.height);
    this.setViewport(0, 0, this.width, this.height);

  }
  //region private
  //resize canvas and use resolution
  setSize(width, height) {
    width |= 0; height |= 0;

    this.depthBuffer = new Float32Array(width * height);
    this.colorBuffer = new Uint8ClampedArray(width * height * 4);

    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;

    this.eyeZ = -this.height;
  }

  setFOV(fov) {
    this.fov = fov;
  }

  setViewport(x, y, width, height) {
    this.viewport = { x, y, width, height };
  }
  //transforms vertex of an object
  transformVertex(point3D, center, sin, cos, translate) {

    let p = new Vec3(point3D)
    let b1, b2;

    p.x -= center.x; p.y -= center.y; p.z -= center.z;
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

  projectPoints(inPoint1, inPoint2) {
    let point1 = this.transformCamPoint(inPoint1);
    let point2 = this.transformCamPoint(inPoint2);

    //clampZ
    {
      let distZ = point1.z - point2.z, distX = point1.x - point2.x, distY = point1.y - point2.y;
      let mXZ = distX / distZ, mYZ = distY / distZ;

      //both behind cam
      if (point1.z < 0 && point2.z < 0) return {
        discarded: true,
      }
      //point1 behind cam
      if (point1.z < 0) {
        point1.z = 0;
        point1.x = point2.x + mXZ * (point1.z - point2.z);
        point1.y = point2.y + mYZ * (point1.z - point2.z);
      }
      //point2 behind cam
      if (point2.z < 0) {
        point2.z = 0;
        point2.x = point1.x + mXZ * (point2.z - point1.z);
        point2.y = point1.y + mYZ * (point2.z - point1.z);
      }
    }

    //project
    let { eyeZ } = this;

    point1.z += eyeZ * 0.99;
    point2.z += eyeZ * 0.99;

    // point1
    let z1 = eyeZ - point1.z;
    // get X
    let m = -point1.x / z1;
    let x1 = m * eyeZ;
    // get Y
    m = -point1.y / z1;
    let y1 = m * eyeZ;

    // point2
    let z2 = eyeZ - point2.z;
    // get X
    m = -point2.x / z2;
    let x2 = m * eyeZ;
    // get Y
    m = -point2.y / z2;
    let y2 = m * eyeZ;

    let hWidth = this.width / 2, hHeight = this.height / 2;

    return {
      discarded: false,
      point1: new Vec3((-x1 + hWidth) | 0, (y1 + hHeight) | 0, -z1),
      point2: new Vec3((-x2 + hWidth) | 0, (y2 + hHeight) | 0, -z2),
    }
  }
  //test whether object in sight and near enough
  objectVisible(location, model) {

    let size = model.size;
    let min = -this.screenDist;
    let c = min;
    min *= 0.9;

    let p = this.transformCamPoint(location);
    let distZX = Math.sqrt(p.z * p.z + p.x * p.x);
    let dist = Math.sqrt(distZX * distZX + p.y * p.y);
    dist += size
    if (dist < -size) return false;
    if (dist > model.renderDist + size) return false;

    dist += min;

    let distZ, distX, distY, m;
    let out = 0;

    distZ = c - dist;
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
  drawLine(start3D, end3D){
    let { point1, point2, discarded } = this.projectPoints(start3D, end3D);
    let { width, height } = this;

    if (discarded === true) return;

    //clamp to screen
    {
      let distX = point1.x - point2.x, distY = point1.y - point2.y, distZ = point1.z - point2.z;
      let mYX = distY / distX, mXY = distX / distY, mZX = distZ / distX, mZY = distZ / distY;

      //clamp left
      if (point1.x < 0) {
        point1.x = 0;
        point1.y = point2.y + mYX * (point1.x - point2.x);
        point1.z = point2.z + mZX * (point1.x - point2.x);
      }
      if (point2.x < 0) {
        point2.x = 0;
        point2.y = point1.y + mYX * (point2.x - point1.x);
        point2.z = point1.z + mZX * (point2.x - point1.x);
      }

      //clamp right
      if (point1.x >= width) {
        point1.x = width - 1;
        point1.y = point2.y + mYX * (point1.x - point2.x);
        point1.z = point2.z + mZX * (point1.x - point2.x);
      }
      if (point2.x >= width) {
        point2.x = width - 1;
        point2.y = point1.y + mYX * (point2.x - point1.x);
        point2.z = point1.z + mZX * (point2.x - point1.x);
      }

      //clamp top
      if (point1.y < 0) {
        point1.y = 0;
        point1.x = point2.x + mXY * (point1.y - point2.y);
        point1.z = point2.z + mZY * (point1.y - point2.y);
      }
      if (point2.y < 0) {
        point2.y = 0;
        point2.x = point1.x + mXY * (point2.y - point1.y);
        point2.z = point1.z + mZY * (point2.y - point1.y);
      }

      //clamp bottom
      if (point1.y >= height) {
        point1.y = height - 1;
        point1.x = point2.x + mXY * (point1.y - point2.y);
        point1.z = point2.z + mZY * (point1.y - point2.y);
      }
      if (point2.y >= height) {
        point2.y = height - 1;
        point2.x = point1.x + mXY * (point2.y - point1.y);
        point2.z = point1.z + mZY * (point2.y - point1.y);
      }
    }

    if (point1.x === point2.x && point1.y === point2.y) return;

    let dist = Math.max(Math.abs(point1.x - point2.x), Math.abs(point1.y - point2.y)) + 1;

    for (let step = 0; step <= dist; step++) {
      let t = step / dist;
      let x = point1.x + t * (point2.x - point1.x);
      let y = point1.y + t * (point2.y - point1.y);
      let z = point1.z + t * (point2.z - point1.z);
      let index = (x|0) + (y|0) * width;
      if (this.depthBuffer[index] > z || this.depthBuffer[index] === 0) {
        this.depthBuffer[index] = z;
        this.colorBuffer[index * 4 + 0] = this.color.r;
        this.colorBuffer[index * 4 + 1] = this.color.g;
        this.colorBuffer[index * 4 + 2] = this.color.b;
      }
    }
  }
  
  startScene() {
    let size = this.width * this.height;
    for (let i = 0; i < size; i++) {
      this.depthBuffer[i] = 0;
      this.colorBuffer[i * 4 + 0] = 0;
      this.colorBuffer[i * 4 + 1] = 0;
      this.colorBuffer[i * 4 + 2] = 0;
      this.colorBuffer[i * 4 + 3] = 255;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  endScene() {
    let data = new ImageData(this.colorBuffer, this.width, this.height);
    this.ctx.putImageData(data, 0, 0);
    this.dstCtx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
  }
}
//endregion
