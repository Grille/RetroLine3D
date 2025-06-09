import Vec3 from "./Vec3.js";

export default class Camera {
    static readonly PIx2 = Math.PI * 2;

    public inputs: CameraInputs

    public viewWidth: number;
    public viewHeight: number;

    public fov: number;
    public eyeZ: number;

    public position: Vec3
    public rotation: Vec3

    public sin: Vec3
    public cos: Vec3

    constructor() {
        this.inputs = new CameraInputs();

        this.position = new Vec3(0, 0, 0)
        this.rotation = new Vec3(0, 0, 0);
        this.sin = new Vec3(0, 0, 0);
        this.cos = new Vec3(0, 0, 0);

        this.viewWidth = 100;
        this.viewHeight = 100;

        this.fov = 90;
        this.eyeZ = 0;

        this.CalcEyeZ();
    }

    public UpdateSinCos(){
        const PIx2 = Camera.PIx2;

        let rot = this.rotation;
        
        if (rot.x < -Math.PI / 2) rot.x = -Math.PI / 2;
        if (rot.x > Math.PI / 2) rot.x = Math.PI / 2;

        if (rot.y >= PIx2) rot.y -= PIx2;
        if (rot.y < 0) rot.y += PIx2;

        Vec3.Sin(this.rotation, this.sin);
        Vec3.Cos(this.rotation, this.cos);
    }

    SetFOV(fov: number) {
        this.fov = fov;

        this.CalcEyeZ();
    }

    CalcEyeZ() {
        let rad = (90 - this.fov / 2) * Math.PI / 180;
        this.eyeZ = -(Math.tan(rad) * (this.viewWidth / 2));
    }

    public Horizon(){
        let pitch = this.rotation.x;
        let hheight = this.viewHeight / 2;
        return hheight + (-this.eyeZ) * Math.tan(pitch);
    }

    public Distance(pos: Vec3){
        const dx = pos.x - this.position.x;
        const dy = pos.y - this.position.y;
        const dz = pos.z - this.position.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public Update(): void {
        const inputs = this.inputs;

        const forward = new Vec3(
            Math.sin(this.rotation.y) * Math.cos(this.rotation.x),
            Math.sin(this.rotation.x),
            Math.cos(this.rotation.y) * Math.cos(this.rotation.x)
        );
        const right = new Vec3(
            Math.cos(this.rotation.y),
            0,
            -Math.sin(this.rotation.y)
        );

        forward.Normalize();
        right.Normalize();

        const movement = new Vec3(0,0,0);

        if (inputs.moveUp) {
            movement.AddScaled(forward, inputs.speed);
        }
        if (inputs.moveDown) {
            movement.AddScaled(forward, -inputs.speed);
        }
        if (inputs.moveRight) {
            movement.AddScaled(right, inputs.speed);
        }
        if (inputs.moveLeft) {
            movement.AddScaled(right, -inputs.speed);
        }

        this.position.Add(movement);
    }

    public RotateByMouse(x: number, y: number) {
        this.rotation.x -= y * 0.1;
        this.rotation.y += x * 0.1;

        const maxPitch = Math.PI / 2 - 0.01;
        this.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, this.rotation.x));
    }
}

class CameraInputs {
    moveUp: boolean
    moveDown: boolean
    moveLeft: boolean
    moveRight: boolean

    speed: number

    constructor() {
        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.speed = 8;
    }

    public AnyMoveInput(): boolean {
        return this.moveUp || this.moveDown || this.moveLeft || this.moveRight
    }
}