import Vec3 from "./Vec3.js";
export default class Mesh {
    constructor() {
        this.size = 0;
        this.vertices = [];
        this.indices = [];
    }
    ParseOBJ(text) {
        let group = Mesh.ParseOBJ(text);
        let keys = Object.keys(group);
        if (keys.length != 1) {
            throw new Error();
        }
        let mesh = group[keys[0]];
        this.size = mesh.size;
        this.vertices = mesh.vertices;
        this.indices = mesh.indices;
    }
    static ParseOBJ(text) {
        let lines = text.split("\n");
        let mesh = new Mesh();
        let group = {
            _default: mesh
        };
        let vertices = mesh.vertices;
        //parse text
        for (let iLine = 0; iLine < lines.length; iLine++) {
            let split = lines[iLine].split(" ");
            try {
                switch (split[0]) {
                    case "o":
                        let name = split[1].trim();
                        mesh = new Mesh();
                        mesh.vertices = vertices;
                        group[name] = mesh;
                        break;
                    case "v":
                        vertices.push(new Vec3(parseFloat(split[1]), parseFloat(split[2]), parseFloat(split[3])));
                        break;
                    case "f":
                        let index0 = parseInt(split[1].split("/", 1)[0]) - 1;
                        mesh.indices.push(index0);
                        for (let i = 2; i < split.length; i++) {
                            let index_ = parseInt(split[i].split("/", 1)[0]) - 1;
                            mesh.indices.push(index_);
                            mesh.indices.push(index_);
                        }
                        mesh.indices.push(index0);
                        break;
                    case "l":
                        for (let i = 1; i < split.length - 1; i++) {
                            mesh.indices.push(parseInt(split[i + 0]) - 1);
                            mesh.indices.push(parseInt(split[i + 1]) - 1);
                        }
                        break;
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        for (let key in group) {
            group[key].RemoveRedundantLines();
            group[key].CalcBoundings();
        }
        return group;
    }
    CalcBoundings() {
        let vertices = this.vertices;
        //find bounding box size
        let max = 0;
        for (let i = 0; i < vertices.length; i++) {
            let vertex = vertices[i];
            max = Math.max(max, Math.abs(vertex.x), Math.abs(vertex.y), Math.abs(vertex.z));
        }
        this.size = Math.sqrt(max * max + max * max);
    }
    RemoveRedundantLines() {
        let indices = this.indices;
        //sort out redundant lines
        let cleanIndices = [];
        for (let i1 = 0; i1 < indices.length; i1 += 2) {
            let consonance = false;
            for (let i2 = i1 + 2; i2 < indices.length; i2 += 2) {
                if ((indices[i1 + 0] == indices[i2 + 0] && indices[i1 + 1] == indices[i2 + 1]) ||
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
