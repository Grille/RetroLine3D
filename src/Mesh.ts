import Vec3 from "./Vec3.js"

export default class Mesh {

    public size: number;
    public vertices: Vec3[];
    public drawDist: number;
    public indices: number[];

    constructor() {
        this.size = 0;
        this.drawDist = 0;
        this.vertices = []
        this.indices = []
    }

    public ParseOBJ(text: String) {
        let lines = text.split("\n");
        let size = 1;
        let vertices: Vec3[] = [];
        let indices: number[] = [];

        //parse text
        for (let i = 0; i < lines.length; i++) {
            let e = lines[i].split(" ");
            try {
                switch (e[0]) {
                    case "v":
                        vertices.push(new Vec3(
                            parseFloat(e[1]),
                            parseFloat(e[2]),
                            parseFloat(e[3]),
                        ));
                        break;
                    case "f":
                        let index0 = parseInt(e[1].split("/", 1)[0]) - 1;
                        indices.push(index0);
                        for (let i = 2; i < e.length; i++) {
                            let index_ = parseInt(e[i].split("/", 1)[0]) - 1;
                            indices.push(index_);
                            indices.push(index_);
                        }
                        indices.push(index0);
                        break;
                    case "l":
                        indices.push(parseInt(e[1]) - 1);
                        indices.push(parseInt(e[2]) - 1);
                        break;
                }
            }
            catch (e) {
                console.error(e);
            }
        }

        this.size = size;
        this.vertices = vertices;
        this.indices = indices;
    }

    public CalcBoundings() {
        let vertices = this.vertices;

        //find bounding box size
        let max = 0;
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i];
            max = Math.max(max, Math.abs(vertex.x), Math.abs(vertex.y), Math.abs(vertex.z));
        }
        this.size = Math.sqrt(max * max + max * max);
    }

    public RemoveRedundantLines() {
        let indices = this.indices;

        //sort out redundant lines
        let cleanIndices: number[] = [];
        for (let i1 = 0; i1 < indices.length; i1 += 2) {
            let consonance = false;
            for (let i2 = i1 + 2; i2 < indices.length; i2 += 2) {
                if (
                    (indices[i1 + 0] == indices[i2 + 0] && indices[i1 + 1] == indices[i2 + 1]) ||
                    (indices[i1 + 0] == indices[i2 + 1] && indices[i1 + 1] == indices[i2 + 0])) {
                    consonance = true;
                    break;
                }
            }
            if (consonance === false) {
                cleanIndices.push(indices[i1 + 0]);
                cleanIndices.push(indices[i1 + 1]);
            }
        }

        this.indices = cleanIndices;
    }
}