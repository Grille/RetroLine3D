import Vec3 from "./Vec3.js";
import Color from "./Color.js";
import rectangle from "./Rectangle.js";
import ProjectionResult from "./ProjectionResult.js";
import Rectangle from "./Rectangle.js";
import Mesh from "./Mesh.js";
import MeshInstance from "./MeshInstance.js";
import Camera from "./Camera.js";

export default class WireframeRender {
    dstCtx: CanvasRenderingContext2D;

    color: Color;
    internalCanvas: HTMLCanvasElement;
    internalCtx: CanvasRenderingContext2D;

    camera: Camera

    depthBuffer: Float32Array;
    colorBuffer: Uint8ClampedArray;

    width: number;
    height: number;

    viewport: rectangle;

    constructor(ctx: CanvasRenderingContext2D) {
        this.dstCtx = ctx;

        this.color = new Color(0, 255, 0);

        this.internalCanvas = document.createElement('canvas');
        let internalCtx = this.internalCanvas.getContext('2d');
        if (internalCtx == null)
            throw new Error();
        this.internalCtx = internalCtx;

        this.camera = new Camera();

        this.depthBuffer = new Float32Array(0);
        this.colorBuffer = new Uint8ClampedArray(0);

        this.width = 0;
        this.height = 0;

        this.setSize(100, 100);
        this.viewport = new Rectangle(0, 0, this.width, this.height);
    }

    //region private
    //resize canvas and use resolution
    setSize(width: number, height: number) {
        width |= 0; height |= 0;

        this.width = width;
        this.height = height;

        this.depthBuffer = new Float32Array(width * height);
        this.colorBuffer = new Uint8ClampedArray(width * height * 4);

        this.internalCanvas.width = width;
        this.internalCanvas.height = height;
        this.camera.viewWidth = width;
        this.camera.viewHeight = height;

        this.camera.CalcEyeZ();
    }

    //transforms vertex of an object
    transformVertex(point3D: Vec3, center: Vec3, sin: Vec3, cos: Vec3, translate: Vec3, scale: number): Vec3 {

        let p = point3D.clone()
        let x, y, z;

        p.x *= scale; p.y *= scale; p.z *= scale;

        p.x -= center.x; p.y -= center.y; p.z -= center.z;
        // X
        y = p.y; z = p.z;
        p.y = y * cos.x - z * sin.x;
        p.z = z * cos.x + y * sin.x;
        // Y
        x = p.x; z = p.z;
        p.x = x * cos.y - z * sin.y;
        p.z = z * cos.y + x * sin.y;
        // Z
        x = p.x; y = p.y;
        p.x = x * cos.z - y * sin.z;
        p.y = y * cos.z + x * sin.z;
        // Translate
        p.x += center.x; p.y += center.y; p.z += center.z;
        p.x += translate.x; p.y += translate.y; p.z += translate.z;

        //if (p.y<0)p.y=0;
        return p;
    }

    //transform vertex relative to camera
    transformCamPoint(point3D: Vec3): Vec3 {
        let p = point3D.clone();
        let x, y, z;
        let { position: pos, cos, sin } = this.camera;
        // Y
        p.x += pos.x; p.y += pos.y; p.z += pos.z;
        x = p.x; z = p.z;
        p.x = x * cos.y - z * sin.y
        p.z = z * cos.y + x * sin.y
        // X
        y = p.y; z = p.z;
        p.y = y * cos.x - z * sin.x;
        p.z = z * cos.x + y * sin.x
        // Z
        x = p.x; y = p.y;
        p.x = x * cos.z - y * sin.z
        p.y = y * cos.z + x * sin.z

        return p;
    }

    //projection matrix, transform vertex into 2d point
    ProjectLine(inPoint1: Vec3, inPoint2: Vec3): ProjectionResult {
        let point1 = this.transformCamPoint(inPoint1);
        let point2 = this.transformCamPoint(inPoint2);

        //clampZ
        {
            let distZ = point1.z - point2.z, distX = point1.x - point2.x, distY = point1.y - point2.y;
            let mXZ = distX / distZ, mYZ = distY / distZ;

            //both behind cam
            if (point1.z < 0 && point2.z < 0)
                return ProjectionResult.DISCARD;

            //point1 behind cam
            if (point1.z < 0) {
                point1.z = 0;
                point1.x = point2.x + mXZ * -point2.z;
                point1.y = point2.y + mYZ * -point2.z;
            }
            //point2 behind cam
            if (point2.z < 0) {
                point2.z = 0;
                point2.x = point1.x + mXZ * -point1.z;
                point2.y = point1.y + mYZ * -point1.z;
            }
        }

        //project
        let { eyeZ } = this.camera;

        point1.z += eyeZ * 0.9999;
        point2.z += eyeZ * 0.9999;

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

        return new ProjectionResult(
            new Vec3((-x1 + hWidth), (y1 + hHeight), -z1),
            new Vec3((-x2 + hWidth), (y2 + hHeight), -z2),
        );
    }

    //test whether object in sight and near enough
    LocationVisible(location: Vec3, size: number, drawDistance: number): boolean {

        let p = this.transformCamPoint(location);
        let distZX = Math.sqrt(p.z * p.z + p.x * p.x);
        let dist = Math.sqrt(distZX * distZX + p.y * p.y);
        dist += size
        if (p.z < -size) return false;
        if (dist > drawDistance + size) return false;

        let { eyeZ: eyeZ } = this.camera;
        dist = p.z + size + eyeZ * 0.99;

        let distZ = eyeZ - dist;
        let x, y, m;


        // test X
        m = (-p.x - size) / distZ;
        x = -m * (0 + eyeZ);
        if (x < -this.width / 2) return false;
        m = (-p.x + size) / distZ;
        x = -m * (0 + eyeZ);
        if (x > this.width / 2) return false;

        // test Y
        m = (-p.y - size) / distZ;
        y = -m * (0 + eyeZ);
        if (y < -this.height / 2) return false;
        m = (-p.y + size) / distZ;
        y = -m * (0 + eyeZ);
        if (y > this.height / 2) return false;

        return true;
    }
    //endregion

    //region public
    //Project a group of vertices and draw the lines between them
    drawMesh(model: Mesh, center: Vec3, rotate: Vec3, translate: Vec3, scale = 1, drawDistance = Number.MAX_SAFE_INTEGER) {
        //model.renderDist=20000
        if (!this.LocationVisible(translate, model.size * scale, drawDistance)) return;

        let sin = new Vec3(0, 0, 0); 
        let cos = new Vec3(1, 1, 1);

        if (rotate.x !== 0) {
            sin.x = Math.sin(rotate.x);
            cos.x = Math.cos(rotate.x);
        }
        if (rotate.y !== 0) {
            sin.y = Math.sin(rotate.y);
            cos.y = Math.cos(rotate.y);
        }
        if (rotate.z !== 0) {
            sin.z = Math.sin(rotate.z);
            cos.z = Math.cos(rotate.z);
        }

        let { vertices, indices } = model;
        for (let i = 0; i < indices.length; i += 2) {
            let vertex1 = this.transformVertex(vertices[indices[i + 0]], center, sin, cos, translate, scale);
            let vertex2 = this.transformVertex(vertices[indices[i + 1]], center, sin, cos, translate, scale);
            this.drawLine(vertex1, vertex2);
        }
    }

    drawMeshInstance(instance: MeshInstance) {
        this.color = instance.color;
        this.drawMesh(instance.model, instance.center, instance.rotation, instance.location, instance.scale, instance.drawDistance)
    }

    /** Project two vertices and draw a line between them */
    drawLine(start3D: Vec3, end3D: Vec3) {
        let { point1, point2, discarded } = this.ProjectLine(start3D, end3D);
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

        //discard out of screen
        if (point1.x === point2.x && point1.y === point2.y) return;

        //draw line
        let distX = (point2.x - point1.x)
        let distY = (point2.y - point1.y)
        let distZ = (point2.z - point1.z)
        let dist = Math.max(Math.abs(distX), Math.abs(distY)) + 1;
        for (let step = 0; step <= dist; step++) {
            let t = step / dist;
            let x = point1.x + t * distX;
            let y = point1.y + t * distY;
            let z = point1.z + t * distZ;
            let index = (x | 0) + (y | 0) * width;
            if (this.depthBuffer[index] > z || this.depthBuffer[index] === 0) {
                this.depthBuffer[index] = z;
                this.colorBuffer[index * 4 + 0] = this.color.r;
                this.colorBuffer[index * 4 + 1] = this.color.g;
                this.colorBuffer[index * 4 + 2] = this.color.b;
            }
        }
    }

    startScene() {
        this.camera.UpdateSinCos();

        let size = this.width * this.height;
        for (let i = 0; i < size; i++) {
            this.depthBuffer[i] = 0;
        }

        let h = this.camera.Horizon()

        for (let iy = 0; iy < this.height; iy++) {
            let y = iy * this.width;
            let color = iy > h ? new Color(0,40,20) : new Color(0,0,20);

            for (let ix = 0; ix < this.width; ix++) {
                let idx = (y + ix) * 4;
                this.colorBuffer[idx + 0] = color.r;
                this.colorBuffer[idx + 1] = color.g;
                this.colorBuffer[idx + 2] = color.b;
                this.colorBuffer[idx + 3] = 255;
            }
        }

        this.internalCtx.clearRect(0, 0, this.internalCanvas.width, this.internalCanvas.height);
    }

    endScene() {
        let data = new ImageData(this.colorBuffer, this.width, this.height);
        this.internalCtx.putImageData(data, 0, 0);
        this.dstCtx.drawImage(this.internalCanvas, 0, 0, this.internalCanvas.width, this.internalCanvas.height, this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
    }
}
//endregion
