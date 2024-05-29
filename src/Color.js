export default class Color {
    constructor(r = 0, g = 0, b = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Clone() {
        return new Color(this.r, this.g, this.b);
    }
    static Mix(out, color1, color2, factor) {
        let nfactor = 1 - factor;
        out.r = color1.r * nfactor + color2.r * factor;
        out.g = color1.g * nfactor + color2.g * factor;
        out.b = color1.b * nfactor + color2.b * factor;
    }
}
