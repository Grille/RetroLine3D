export default class Vec3 {

    public static readonly ZERO = new Vec3(0, 0, 0);

    public x: number;
    public y: number;
    public z: number;

    static fromObj(obj: any) {
        return new Vec3(obj.x, obj.y, obj.z);
    }

    constructor(p1 = 0, p2 = 0, p3 = 0) {
        this.x = p1;
        this.y = p2;
        this.z = p3;
    }
    length() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }
    normalize() {
        let length = this.length();
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }
    add(vec3: Vec3) {
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
    }
    scaleAndAdd(vec3: Vec3, scale: number) {
        this.x += vec3.x * scale;
        this.y += vec3.y * scale;
        this.z += vec3.z * scale;
    }
    distance(vec: Vec3){
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        const dz = this.z - vec.z;
      
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}


enum hjk {
    hgjf = 7
}