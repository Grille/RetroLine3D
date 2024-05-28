export default class Color {
    public r: number;
    public g: number;
    public b: number;
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    clone() {
        return new Color(this.r, this.g, this.b);
    }
}
