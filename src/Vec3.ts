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
        return new Vec3(this.x / length, this.y / length, this.z / length);
    }
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}


enum hjk {
    hgjf = 7
}