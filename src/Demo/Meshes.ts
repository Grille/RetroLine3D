import Mesh from "../Mesh.js";

export default class Meshes {
    public cloud: Mesh
    public tree: Mesh
    public house: Mesh
    public tower: Mesh

    public userdrop: Mesh[]

    constructor() {
        let meshes_obj = Mesh.ParseOBJ(loadText("./assets/models.obj"));

        this.cloud = meshes_obj.cloud;
        this.tower = meshes_obj.atc;
        this.house = meshes_obj.house;
        this.tree = meshes_obj.tree;

        this.userdrop = [];

        this.RegisterEvents();
    }

    RegisterEvents() {

        let cthis = this;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            window.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        window.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            if (dt == null)
                return;
            const files = dt.files;
            if (files.length > 0) {
                const file = files[0];
                readFile(file);
            }
        });
        function readFile(file: File) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target?.result;
                try {
                    cthis.userdrop = []
                    var drop = Mesh.ParseOBJ(text as string);
                    for (let key in drop) {
                        cthis.userdrop.push(drop[key])
                    }
                }
                catch (e) {
                    cthis.userdrop = []
                    alert(e);
                }
            }
            reader.readAsText(file);
        }

    }
}

function loadText(path: string): string {
    let request = new XMLHttpRequest();
    request.open("GET", path, false);
    request.send(null)
    return request.responseText;
}