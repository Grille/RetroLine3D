import Vec3 from "./Vec3.js";
class Camera {
    constructor() {
        this.inputs = new CameraInputs();
        this.position = new Vec3(0, -10, 0);
        this.rot = new Vec3(0, 0, 0);
        this.sin = new Vec3(0, 0, 0);
        this.cos = new Vec3(0, 0, 0);
        this.viewWidth = 100;
        this.viewHeight = 100;
        this.fov = 90;
        this.eyeZ = 0;
        this.CalcEyeZ();
    }
    UpdateSinCos() {
        const PIx2 = Camera.PIx2;
        let rot = this.rot;
        if (rot.x < -Math.PI / 2)
            rot.x = -Math.PI / 2;
        if (rot.x > Math.PI / 2)
            rot.x = Math.PI / 2;
        if (rot.y >= PIx2)
            rot.y -= PIx2;
        if (rot.y < 0)
            rot.y += PIx2;
        this.sin.x = Math.sin(this.rot.x);
        this.sin.y = Math.sin(this.rot.y);
        this.sin.z = Math.sin(this.rot.z);
        this.cos.x = Math.cos(this.rot.x);
        this.cos.y = Math.cos(this.rot.y);
        this.cos.z = Math.cos(this.rot.z);
    }
    SetFOV(fov) {
        this.fov = fov;
        this.CalcEyeZ();
    }
    CalcEyeZ() {
        let rad = (90 - this.fov / 2) * Math.PI / 180;
        this.eyeZ = -(Math.tan(rad) * (this.viewWidth / 2));
    }
    Horizon() {
        let pitch = this.rot.x;
        let hheight = this.viewHeight / 2;
        return hheight + (-this.eyeZ) * Math.tan(pitch);
    }
    Distance(pos) {
        const dx = pos.x + this.position.x;
        const dy = pos.y + this.position.y;
        const dz = pos.z + this.position.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    Update() {
        const inputs = this.inputs;
        const forward = new Vec3(Math.sin(this.rot.y), this.rot.x, Math.cos(this.rot.y));
        const right = new Vec3(Math.cos(this.rot.y), 0, -Math.sin(this.rot.y));
        forward.normalize();
        right.normalize();
        const movement = new Vec3(0, 0, 0);
        if (inputs.moveUp) {
            movement.scaleAndAdd(forward, -inputs.speed);
        }
        if (inputs.moveDown) {
            movement.scaleAndAdd(forward, inputs.speed);
        }
        if (inputs.moveLeft) {
            movement.scaleAndAdd(right, inputs.speed);
        }
        if (inputs.moveRight) {
            movement.scaleAndAdd(right, -inputs.speed);
        }
        this.position.add(movement);
        if (this.position.y > 0) {
            this.position.y = 0;
        }
    }
    RotateByMouse(x, y) {
        this.rot.x -= y * 0.1;
        this.rot.y += x * 0.1;
        const maxPitch = Math.PI / 2 - 0.01;
        this.rot.x = Math.max(-maxPitch, Math.min(maxPitch, this.rot.x));
    }
}
Camera.PIx2 = Math.PI * 2;
export default Camera;
class CameraInputs {
    constructor() {
        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.speed = 8;
    }
    AnyMoveInput() {
        return this.moveUp || this.moveDown || this.moveLeft || this.moveRight;
    }
}
