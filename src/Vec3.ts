export default class Vec3 {

    public static readonly ZERO = new Vec3(0, 0, 0);
    public static readonly ONE = new Vec3(1, 1, 1);
    public static readonly UNIT_X = new Vec3(1, 0, 0);
    public static readonly UNIT_Y = new Vec3(0, 1, 0);
    public static readonly UNIT_Z = new Vec3(0, 0, 1);

    public x: number;
    public y: number;
    public z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static CreateEmpty(): Vec3 {
        return new Vec3(0, 0, 0);
    }

    static FromNumber(number: number) {
        return new Vec3(number, number, number);
    }

    static FromArray(array: number[], offset: number) {
        return new Vec3(array[0 + offset], array[1 + offset], array[2 + offset]);
    }

    static FromObj(obj: any) {
        return new Vec3(obj.x, obj.y, obj.z);
    }

    static Add(a: Vec3, b: Vec3, out: Vec3) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;
    }

    static Sub(a: Vec3, b: Vec3, out: Vec3) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;
    }

    static Mul(a: Vec3, b: Vec3, out: Vec3) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;
    }

    static Div(a: Vec3, b: Vec3, out: Vec3) {
        out.x = a.x / b.x;
        out.y = a.y / b.y;
        out.z = a.z / b.z;
    }

    static MulByNumber(a: Vec3, b: number, out: Vec3) {
        out.x = a.x * b;
        out.y = a.y * b;
        out.z = a.z * b;
    }

    static DivByNumber(a: Vec3, b: number, out: Vec3) {
        out.x = a.x / b;
        out.y = a.y / b;
        out.z = a.z / b;
    }

    static Sin(rotation: Vec3, out: Vec3) {
        out.x = Math.sin(rotation.x);
        out.y = Math.sin(rotation.y);
        out.z = Math.sin(rotation.z);
    }

    static Cos(rotation: Vec3, out: Vec3) {
        out.x = Math.cos(rotation.x);
        out.y = Math.cos(rotation.y);
        out.z = Math.cos(rotation.z);
    }

    Length(): number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }

    Normalize() {
        let length = this.Length();
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }

    Add(vec3: Vec3) {
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
    }

    Sub(vec3: Vec3) {
        this.x -= vec3.x;
        this.y -= vec3.y;
        this.z -= vec3.z;
    }

    Mul(vec3: Vec3) {
        this.x *= vec3.x;
        this.y *= vec3.y;
        this.z *= vec3.z;
    }

    Div(vec3: Vec3) {
        this.x /= vec3.x;
        this.y /= vec3.y;
        this.z /= vec3.z;
    }

    Scale(scale: number) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
    }

    AddScaled(vec3: Vec3, scale: number) {
        this.x += vec3.x * scale;
        this.y += vec3.y * scale;
        this.z += vec3.z * scale;
    }

    Set(vec3: Vec3){
        this.x = vec3.x;
        this.y = vec3.y;
        this.z = vec3.z;
    }

    SetValues(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }


    Distance(vec: Vec3): number {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        const dz = this.z - vec.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    Clone(): Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }
}