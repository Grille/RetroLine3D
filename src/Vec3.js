class Vec3 {
    static fromObj(obj) {
        return new Vec3(obj.x, obj.y, obj.z);
    }
    constructor(p1 = 0, p2 = 0, p3 = 0) {
        this.x = p1;
        this.y = p2;
        this.z = p3;
    }
    static GetRndLocation(radius) {
        let size = radius * 2;
        return new Vec3(Math.random() * size - radius, 0, Math.random() * size - radius);
    }
    Length() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }
    Normalize() {
        let length = this.Length();
        this.x /= length;
        this.y /= length;
        this.z /= length;
    }
    Add(vec3) {
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
    }
    ScaleAndAdd(vec3, scale) {
        this.x += vec3.x * scale;
        this.y += vec3.y * scale;
        this.z += vec3.z * scale;
    }
    Distance(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        const dz = this.z - vec.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    Clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}
Vec3.ZERO = new Vec3(0, 0, 0);
export default Vec3;
