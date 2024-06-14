(function () {
    'use strict';

    class _vec2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    function vec2(x, y) {
        return new _vec2(0, 0);
    }

    class _vec3 {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        add(v) {
            return vec3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        sub(v) {
            return vec3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        mul(a) {
            return vec3(this.x * a, this.y * a, this.z * a);
        }
        div(a) {
            return vec3(this.x / a, this.y / a, this.z / a);
        }
        dot(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        }
        cross(v) {
            return vec3(
                this.y * v.z - this.z * v.y,
                this.z * v.x - this.x * v.z,
                this.x * v.y - this.y * v.x
            );
        }
        len2() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }
        len() {
            return Math.sqrt(this.len2());
        }
        norm() {
            return vec3(this.div(this.len()));
        }
        mulmat(m) {
            let w = this.x * m.a[0][3] + this.y * m.a[1][3] + this.z * m.a[2][3] + m.a[3][3];

            return vec3(
                (this.x * m.a[0][0] + this.y * m.a[1][0] + this.z * m.a[2][0] + m.a[3][0]) / w,
                (this.x * m.a[0][1] + this.y * m.a[1][1] + this.z * m.a[2][1] + m.a[3][1]) / w,
                (this.x * m.a[0][2] + this.y * m.a[1][2] + this.z * m.a[2][2] + m.a[3][2]) / w
            );
        }
        transform(m) {
            return vec3(
                this.x * m.a[0][0] + this.y * m.a[1][0] + this.z * m.a[2][0],
                this.x * m.a[0][1] + this.y * m.a[1][1] + this.z * m.a[2][1],
                this.x * m.a[0][2] + this.y * m.a[1][2] + this.z * m.a[2][2]
            )
        }
        pointTransform(m) {
            return vec3(
                this.x * m.a[0][0] + this.y * m.a[1][0] + this.z * m.a[2][0] + m.a[3][0],
                this.x * m.a[0][1] + this.y * m.a[1][1] + this.z * m.a[2][1] + m.a[3][1],
                this.x * m.a[0][2] + this.y * m.a[1][2] + this.z * m.a[2][2] + m.a[3][2]
            )
        }
    }

    function vec3(x, y, z) {
        if (x == undefined)
            return new _vec3(0, 0, 0);
        if (typeof(x) == "object")
            return new _vec3(x.x, x.y, x.z);
        if (y == undefined)
            return new _vec3(x, x, x);
        return new _vec3(x, y, z);
    }

    class _mat4 {
        constructor(
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            a30, a31, a32, a33
        ) {
            this.a = [
                [a00, a01, a02, a03],
                [a10, a11, a12, a13],
                [a20, a21, a22, a23],
                [a30, a31, a32, a33]
            ];
        }

        setFrustum(left, right, bottom, top, near, far) {
            this.a = [
                [2 * near / (right - left), 0, 0, 0],
                [0, 2 * near / (top - bottom), 0, 0],
                [(right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1],
                [0, 0, -2 * near * far / (far - near), 0]
            ];
        }

        setView(loc, at, up1) {
            let 
                dir = at.sub(loc).norm(),
                right = dir.cross(up1).norm(),
                up = right.cross(dir).norm();
            this.a = [
                [right.x, up.x, -dir.x, 0],
                [right.y, up.y, -dir.y, 0],
                [right.z, up.z, -dir.z, 0],
                [-loc.dot(right), -loc.dot(up), loc.dot(dir), 1]
            ];

            return {dir: dir, up: up, right: right};
        }

        mul(m) {
            return mat4(
                this.a[0][0] * m.a[0][0] + this.a[0][1] * m.a[1][0] + this.a[0][2] * m.a[2][0] + this.a[0][3] * m.a[3][0],
                this.a[0][0] * m.a[0][1] + this.a[0][1] * m.a[1][1] + this.a[0][2] * m.a[2][1] + this.a[0][3] * m.a[3][1],
                this.a[0][0] * m.a[0][2] + this.a[0][1] * m.a[1][2] + this.a[0][2] * m.a[2][2] + this.a[0][3] * m.a[3][2],
                this.a[0][0] * m.a[0][3] + this.a[0][1] * m.a[1][3] + this.a[0][2] * m.a[2][3] + this.a[0][3] * m.a[3][3],

                this.a[1][0] * m.a[0][0] + this.a[1][1] * m.a[1][0] + this.a[1][2] * m.a[2][0] + this.a[1][3] * m.a[3][0],
                this.a[1][0] * m.a[0][1] + this.a[1][1] * m.a[1][1] + this.a[1][2] * m.a[2][1] + this.a[1][3] * m.a[3][1],
                this.a[1][0] * m.a[0][2] + this.a[1][1] * m.a[1][2] + this.a[1][2] * m.a[2][2] + this.a[1][3] * m.a[3][2],
                this.a[1][0] * m.a[0][3] + this.a[1][1] * m.a[1][3] + this.a[1][2] * m.a[2][3] + this.a[1][3] * m.a[3][3],

                this.a[2][0] * m.a[0][0] + this.a[2][1] * m.a[1][0] + this.a[2][2] * m.a[2][0] + this.a[2][3] * m.a[3][0],
                this.a[2][0] * m.a[0][1] + this.a[2][1] * m.a[1][1] + this.a[2][2] * m.a[2][1] + this.a[2][3] * m.a[3][1],
                this.a[2][0] * m.a[0][2] + this.a[2][1] * m.a[1][2] + this.a[2][2] * m.a[2][2] + this.a[2][3] * m.a[3][2],
                this.a[2][0] * m.a[0][3] + this.a[2][1] * m.a[1][3] + this.a[2][2] * m.a[2][3] + this.a[2][3] * m.a[3][3],

                this.a[3][0] * m.a[0][0] + this.a[3][1] * m.a[1][0] + this.a[3][2] * m.a[2][0] + this.a[3][3] * m.a[3][0],
                this.a[3][0] * m.a[0][1] + this.a[3][1] * m.a[1][1] + this.a[3][2] * m.a[2][1] + this.a[3][3] * m.a[3][1],
                this.a[3][0] * m.a[0][2] + this.a[3][1] * m.a[1][2] + this.a[3][2] * m.a[2][2] + this.a[3][3] * m.a[3][2],
                this.a[3][0] * m.a[0][3] + this.a[3][1] * m.a[1][3] + this.a[3][2] * m.a[2][3] + this.a[3][3] * m.a[3][3]
            )
        }
    }

    function mat4(
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        a30, a31, a32, a33
    ) {
        if (a00 == undefined)
            return new _mat4(
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            );
        if (a00 == 1 && a01 == undefined)
            return new _mat4(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        if (typeof a00 == "object")
            return new _mat4(
                a00[0][0], a00[0][1], a00[0][2], a00[0][3],
                a00[1][0], a00[1][1], a00[1][2], a00[1][3],
                a00[2][0], a00[2][1], a00[2][2], a00[2][3],
                a00[3][0], a00[3][1], a00[3][2], a00[3][3]
            )
        return new _mat4(
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            a30, a31, a32, a33
        );
    }

    function rotate(angle, axis) {
        let 
            s = Math.sin(angle),
            c = Math.cos(angle);
        let v = axis.norm();

        return mat4(
            c + v.x * v.x * (1 - c), v.x * v.y * (1 - c) + v.z * s, v.x * v.z * (1 - c) - v.y * s, 0,
            v.y * v.x * (1 - c) - v.z * s, c + v.y * v.y * (1 - c), v.y * v.z * (1 - c) + v.x * s, 0,
            v.z * v.x * (1 - c) + v.y * s, v.z * v.y * (1 - c) - v.x * s, c + v.z * v.z * (1 - c), 0,
            0, 0, 0, 1
        )
    }

    function translate(s) {
        let m = mat4(1);

        m.a[3][0] = s.x;
        m.a[3][1] = s.y;
        m.a[3][2] = s.z;

        return m;
    }

    function scale(s) {
        return mat4(
            s.x, 0, 0, 0,
            0, s.y, 0, 0,
            0, 0, s.z, 0,
            0, 0, 0, 1
        );
    }

    class Camera {
        constructor(width, height, loc, at, up) {
            this.projSize = 0.1;
            this.projDist = 0.1;
            this.farClip = 300;

            this.width = width;
            this.height = height;

            let rx = this.projSize;
            let ry = this.projSize;

            if (this.width >= this.height)
                rx *= this.width / this.height;
            else
                ry *= this.height / this.width;

            this.proj = mat4();
            this.proj.setFrustum(-rx * 0.5, rx * 0.5, -ry * 0.5, ry * 0.5, this.projDist, this.farClip);
            this.view = mat4();
            this.update(loc, at, up);
        }
        update(loc, at, up) {
            let info = this.view.setView(loc, at, up);
            this.loc = loc;
            this.at = at;
            this.right = info.right;
            this.up = info.up;
            this.dir = info.dir;

            this.viewProj = this.view.mul(this.proj);
        }
    }

    class UniformBlock {
        constructor(rnd, name, size, bind) {
            this.name = name;
            this.size = size;
            this.bind = bind;
            this.buffer = rnd.gl.createBuffer();
            this.rnd = rnd;

            rnd.gl.bindBuffer(rnd.gl.UNIFORM_BUFFER, this.buffer);
            rnd.gl.bufferData(rnd.gl.UNIFORM_BUFFER, this.size, rnd.gl.DYNAMIC_DRAW);
        }

        update(offset, data) {
            this.rnd.gl.bindBuffer(this.rnd.gl.UNIFORM_BUFFER, this.buffer);
            this.rnd.gl.bufferSubData(
                this.rnd.gl.UNIFORM_BUFFER,
                offset,
                data, 0
            );
        }

        apply(shd) {
            if (shd.prg == undefined || this.rnd == undefined)
                return;
            this.rnd.gl.uniformBlockBinding(shd.prg, shd.uniformBlocks[this.name].index, this.bind);
            this.rnd.gl.bindBufferBase(this.rnd.gl.UNIFORM_BUFFER, this.bind, this.buffer);
        }
    }

    class Render {
        // Load and compile shader function
        loadShader(shaderType, shaderSource) {
            const shader = this.gl.createShader(shaderType);
            this.gl.shaderSource(shader, shaderSource);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                let buf = this.gl.getShaderInfoLog(shader);
                console.log('Shader compile fail: ' + buf);
            }                                            
            return shader;
        } // End of 'loadShader' function

        // GL Initializatoin + class names initializaiton function.
        constructor(canvas) {
            let rect = canvas.getBoundingClientRect();

            this.gl = canvas.getContext("webgl2");
            this.width = rect.right - rect.left + 1;
            this.height = rect.bottom - rect.top + 1;

            this.gl.enable(this.gl.DEPTH_TEST);

            this.cameraUbo = new UniformBlock(this, "Camera", 32, 1);

            this.gl.clearColor(0.5, 0.4, 1, 1);

            // Setup camera
            this.camera = new Camera(this.width, this.height, vec3(0, 0, 5), vec3(0), vec3(0, 1, 0));
        } // End of 'constructor' function

        // WebGL rendering function.
        renderStart() { 
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

            this.cameraUbo.update(0, new Float32Array([this.camera.loc.x, this.camera.loc.y, this.camera.loc.z, 0, this.camera.dir.x, this.camera.dir.y, this.camera.dir.z, 0]));
            // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        } // End of 'render' function
    }

    class _vertex {
        constructor(pos, norm, texCoord) {
            this.pos = pos;
            this.norm = norm;
            this.texCoord = texCoord;
        }
    }

    function vertex(pos, norm, texCoord) {
        return new _vertex(pos, vec3(), vec2());
    }

    function autoNormals(verts, inds) {
        /* Set all vertex normals to zero */
        for (let i = 0; i < verts.length; i++)
            verts[i].norm = vec3();
        
        /* Eval normal for every facet */
        for (let i = 0; i < inds.length; i += 3)
        {
            let
                n0 = inds[i], n1 = inds[i + 1], n2 = inds[i + 2];
            let
                p0 = verts[n0].pos,
                p1 = verts[n1].pos,
                p2 = verts[n2].pos,
                N = p1.sub(p0).cross(p2.sub(p0)).norm();
        
            verts[n0].norm = verts[n0].norm.add(N);
            verts[n1].norm = verts[n1].norm.add(N);
            verts[n2].norm = verts[n2].norm.add(N);
        }
        
        /* Normalize all vertex normals */
        for (let i = 0; i < verts.length; i++)
            verts[i].norm = verts[i].norm.norm();
    }

    function clearEmpty(arr) {
        for (let i = 0; i < arr.length; i++)
            if (arr[i] == "") {
                arr.splice(i, 1);
                i--;
            }
    }

    class Prim {
        constructor(mtl, verts, inds) {
            this._init(mtl, verts, inds);
        }
        _init(mtl, verts, inds) {
            let vtts = [], i = 0;
            this.mtl = mtl; 
            this.verts = [...verts];
            this.inds = [...inds];
            this.vertexArray = null;
            this.vertexBuffer = null;
            this.indexBuffer = null;
            this.ubo = null;

            if (mtl.shd.prg == null)
                return;

            this.ubo = new UniformBlock(mtl.shd.rnd, "Prim", 64 * 2, 0);

            for (let el of verts) {
                vtts[i++] = el.pos.x;
                vtts[i++] = el.pos.y;
                vtts[i++] = el.pos.z;
                vtts[i++] = el.norm.x;
                vtts[i++] = el.norm.y;
                vtts[i++] = el.norm.z;
                vtts[i++] = el.texCoord.x;
                vtts[i++] = el.texCoord.y;
            }
            this.vertexArray = mtl.shd.rnd.gl.createVertexArray();
            mtl.shd.rnd.gl.bindVertexArray(this.vertexArray);
            this.vertexBuffer = mtl.shd.rnd.gl.createBuffer();

            mtl.shd.rnd.gl.bindBuffer(mtl.shd.rnd.gl.ARRAY_BUFFER, this.vertexBuffer);
            mtl.shd.rnd.gl.bufferData(mtl.shd.rnd.gl.ARRAY_BUFFER, new Float32Array(vtts), mtl.shd.rnd.gl.STATIC_DRAW);

            if (mtl.shd.attrs["InPosition"] != undefined && mtl.shd.attrs["InNormal"] != undefined && mtl.shd.attrs["InTexCoord"] != undefined) {
                mtl.shd.rnd.gl.vertexAttribPointer(mtl.shd.attrs["InPosition"].loc, 3, mtl.shd.rnd.gl.FLOAT, false, 32, 0);
                mtl.shd.rnd.gl.enableVertexAttribArray(mtl.shd.attrs["InPosition"].loc);
                mtl.shd.rnd.gl.vertexAttribPointer(mtl.shd.attrs["InNormal"].loc, 3, mtl.shd.rnd.gl.FLOAT, false, 32, 12);
                mtl.shd.rnd.gl.enableVertexAttribArray(mtl.shd.attrs["InNormal"].loc);
                mtl.shd.rnd.gl.vertexAttribPointer(mtl.shd.attrs["InTexCoord"].loc, 2, mtl.shd.rnd.gl.FLOAT, false, 32, 24);
                mtl.shd.rnd.gl.enableVertexAttribArray(mtl.shd.attrs["InTexCoord"].loc);
            }

            this.indexBuffer = mtl.shd.rnd.gl.createBuffer();
            mtl.shd.rnd.gl.bindBuffer(mtl.shd.rnd.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            mtl.shd.rnd.gl.bufferData(mtl.shd.rnd.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(inds), mtl.shd.rnd.gl.STATIC_DRAW);

            this.numOfElements = inds.length;

            this.world = mat4(1);
        }
        async loadOBJ(dir) {
            let vts = [], inds = [];

            let file = await fetch(dir);
            let text = await file.text();
            let lines = text.split("\n");

            for (let line of lines) {
                if (line[0] == "v") {
                    let p = line.split(" ");
                    clearEmpty(p);

                    let v = vec3(parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3]));

                    vts.push(vertex(v));
                }
                if (line[0] == "f") {
                    let block = line.split(" ");
                    
                    inds.push(parseInt(block[1].split("/")[0]) - 1);
                    inds.push(parseInt(block[2].split("/")[0]) - 1);
                    inds.push(parseInt(block[3].split("/")[0]) - 1);
                }
            }

            autoNormals(vts, inds);

            this._init(this.mtl, vts, inds);
        }
        draw() {
            if (this.mtl.shd.prg != null && this.vertexArray == null)
                this._init(this.mtl, this.verts, this.inds);
            if (this.mtl.shd.prg == null)
                return;

            this.mtl.apply();

            if (this.mtl.shd.uniformBlocks["Prim"] != undefined) {
                this.ubo.update(0, new Float32Array([].concat(...(this.world.mul(this.mtl.shd.rnd.camera.viewProj)).a).concat(...this.world.a)));
                this.ubo.apply(this.mtl.shd);
            }
            if (this.mtl.shd.uniformBlocks["Camera"] != undefined) {
                this.mtl.shd.rnd.cameraUbo.apply(this.mtl.shd);
            }
            
            this.mtl.shd.rnd.gl.bindVertexArray(this.vertexArray);
            this.mtl.shd.rnd.gl.bindBuffer(this.mtl.shd.rnd.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.mtl.shd.rnd.gl.drawElements(this.mtl.shd.rnd.gl.TRIANGLES, this.numOfElements, this.mtl.shd.rnd.gl.UNSIGNED_INT, 0);
        }
    }

    class Plat {
        constructor(verts) {
            this.verts = [...verts];
        }
        createCube() {
            let verts = [
                [vec3(-0.5, -0.5, -0.5), vec3(-0.5, 0.5, -0.5), vec3(0.5, 0.5, -0.5), vec3(0.5, -0.5, -0.5)], // front
                [vec3(-0.5, -0.5, 0.5), vec3(-0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(0.5, -0.5, 0.5)],     // back
                [vec3(-0.5, -0.5, -0.5), vec3(-0.5, 0.5, -0.5), vec3(-0.5, 0.5, 0.5), vec3(-0.5, -0.5, 0.5)], // left
                [vec3(0.5, -0.5, -0.5), vec3(0.5, 0.5, -0.5), vec3(0.5, 0.5, 0.5), vec3(0.5, -0.5, 0.5)],     // right
                [vec3(-0.5, -0.5, -0.5), vec3(-0.5, -0.5, 0.5), vec3(0.5, -0.5, 0.5), vec3(0.5, -0.5, -0.5)], // bottom
                [vec3(-0.5, 0.5, -0.5), vec3(-0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, -0.5)],     // bottom
            ];

            return new Plat(verts);
        }
        createTetrohedron() {
            let sq2 = Math.sqrt(2), sq3 = Math.sqrt(3);
            let k = sq3 / 2, k1 = sq2 / sq3;
            let p0 = vec3(-0.5, -1/3 * k, 0), p1 = p0.add(vec3(0.5, k, 0)), p2 = p0.add(vec3(1, 0, 0));
            let p3 = p0.add(p1).add(p2).div(3).add(vec3(0, 0, -k1));

            let verts = [
                [p0, p1, p2],
                [p0, p1, p3],
                [p1, p2, p3], 
                [p2, p0, p3]
            ];
            return new Plat(verts);
        }

        createOctahedron() {
            let k = 1 / Math.sqrt(2);
            let verts = [
                [vec3(-0.5, 0, -0.5), vec3(0, k, 0), vec3(0.5, 0, -0.5)],
                [vec3(0.5, 0, -0.5), vec3(0, k, 0), vec3(0.5, 0, 0.5)],
                [vec3(0.5, 0, 0.5), vec3(0, k, 0), vec3(-0.5, 0, 0.5)],
                [vec3(-0.5, 0, 0.5), vec3(0, k, 0), vec3(-0.5, 0, -0.5)],
                [vec3(-0.5, 0, -0.5), vec3(0, -k, 0), vec3(0.5, 0, -0.5)],
                [vec3(0.5, 0, -0.5), vec3(0, -k, 0), vec3(0.5, 0, 0.5)],
                [vec3(0.5, 0, 0.5), vec3(0, -k, 0), vec3(-0.5, 0, 0.5)],
                [vec3(-0.5, 0, 0.5), vec3(0, -k, 0), vec3(-0.5, 0, -0.5)],
            ];
            return new Plat(verts);
        }

        createIcosahedron() {
            let verts = [];
            let layer1 = [];
            let layer2 = [];

            let r = 1 / (2 * Math.sin(36 / 180 * Math.PI)); 
            let d = Math.sqrt(1 - 2 * Math.sin(18 / 180 * Math.PI) * r);

            for (let angle = 0; angle < 360; angle += 72) {
                let a = angle / 180 * Math.PI;

                layer1.push(vec3(r * Math.sin(a), r * Math.cos(a), d * 0.5));
            }
            for (let angle = 36; angle < 360; angle += 72) {
                let a = angle / 180 * Math.PI;

                layer2.push(vec3(r * Math.sin(a), r * Math.cos(a), -d * 0.5));
            }
            for (let i = 0; i < layer1.length; i++) {
                let tri = [layer1[i], layer2[i], layer2[(i - 1 + 5) % 5]];
                verts.push(tri);
            }
            for (let i = 0; i < layer2.length; i++) {
                let tri = [layer2[i], layer1[i], layer1[(i + 1) % 5]];
                verts.push(tri);
            }

            let top = vec3(0, 0, r), bottom = vec3(0, 0, -r);
            for (let i = 0; i < 5; i++) {
                verts.push([layer1[i], layer1[(i + 1) % 5], top]);
                verts.push([layer2[i], layer2[(i + 1) % 5], bottom]);
            }

            return new Plat(verts);
        } 
        createDodecahedron() {
            let verts = [];
            let r = (Math.sqrt(10) * Math.sqrt(5 + Math.sqrt(5))) / 10;
            let R = 0.25 * (1 + Math.sqrt(5)) * Math.sqrt(3);
            let h = Math.sqrt(R * R - r * r);
            let r0 = r * 2 * Math.cos(36 / 180 * Math.PI);
            let d = Math.sqrt(R * R - r0 * r0);

            let top = [], bottom = [];
            let middle = [];

            for (let angle = 0; angle < 360; angle += 72) {
                let a = angle / 180 * Math.PI;
                let b = (angle + 36) / 180 * Math.PI;

                top.push(vec3(Math.sin(a) * r, Math.cos(a) * r, h));
                bottom.push(vec3(Math.sin(b) * r, Math.cos(b) * r, -h));

                middle.push(vec3(Math.sin(a) * r0, Math.cos(a) * r0, d));
                middle.push(vec3(Math.sin(b) * r0, Math.cos(b) * r0, -d));
            }

            verts.push(top);
            verts.push(bottom);

            for (let i = 0; i < 5; i++) {
                verts.push([top[i], middle[i * 2], middle[(i * 2 + 1) % 10], middle[(i * 2 + 2) % 10], top[(i + 1) % 5]]);
                verts.push([bottom[i], middle[(i * 2 + 1) % 10], middle[(i * 2 + 2) % 10], middle[(i * 2 + 3) % 10], bottom[(i + 1) % 5]]);
            }

            //verts.push(middle);
            return new Plat(verts);
        }

        createPrim(mtl) {
            let inds = [];
            let v = [];
            let j = 0;

            for (let g of this.verts)
            {
                for (let p of g)
                    v.push(vertex(p));

                for (let i = 2; i < g.length; i++) {
                    inds.push(0 + j);
                    inds.push(i - 1 + j);
                    inds.push(i + j);
                }
                j += g.length;
            }

            autoNormals(v, inds);

            let r = v[0].pos.len();
            let rr = v[0].pos.x * v[0].pos.x + v[0].pos.z * v[0].pos.z;

            rr = Math.sqrt(rr);

            for (let i = 0; i < v.length; i++) {
                v[i].texCoord.x = (Math.atan2(v[i].pos.x / rr, v[i].pos.z / rr) + Math.PI) / Math.PI * 0.5;
                v[i].texCoord.y = (Math.acos(v[i].pos.y / r)) / Math.PI;
                // v[i].texCoord.x = (Math.atan(v[i].pos.y / v[i].pos.x) + Math.PI / 2) / Math.PI;
                // v[i].texCoord.y = Math.acos(v[i].pos.z / r) / Math.PI;
            }

            return new Prim(mtl, v, inds);
        }
    }

    class Shader {
        constructor(rnd, name) {
           this.rnd = rnd;
           this.name = name;
           this.prg = null;
           this.attrs = [];
           this.uniforms = [];

           this._init();
        }
        
        async _init() {
            this.shaders =
            [
            {
                id: null,
                type: this.rnd.gl.VERTEX_SHADER,
                name: "vert",
                src: "",
            },
            {
                id: null,
                type: this.rnd.gl.FRAGMENT_SHADER,
                name: "frag",
                src: "",
            }
            ];

            for (const s of this.shaders) {
                let response = await fetch(`bin/shaders/${this.name}/${s.name}.glsl`);
                let src = await response.text();
                if (typeof src == "string" && src != "")
                    s.src = src;
            }
            this.updateShadersSource();
        }

        updateShadersSource() { 
            this.shaders[0].id = null;
            this.shaders[1].id = null;
            this.prg = null;
            if (this.shaders[0].src == "" || this.shaders[1].src == "")
                return;
            this.shaders.forEach(s => {
                s.id = this.rnd.gl.createShader(s.type);
                this.rnd.gl.shaderSource(s.id, s.src);
                this.rnd.gl.compileShader(s.id);
                if (!this.rnd.gl.getShaderParameter(s.id, this.rnd.gl.COMPILE_STATUS)) {
                    let buf = this.rnd.gl.getShaderInfoLog(s.id);
                    console.log(`Shader ${this.name}/${s.name} compile fail: ${buf}`);
                }                                            
            });             
            this.prg = this.rnd.gl.createProgram();
            this.shaders.forEach(s => {
                if (s.id != null)
                    this.rnd.gl.attachShader(this.prg, s.id);
            });
            this.rnd.gl.linkProgram(this.prg);
            if (!this.rnd.gl.getProgramParameter(this.prg, this.rnd.gl.LINK_STATUS)) {
                let buf = this.rnd.gl.getProgramInfoLog(this.prg);
                console.log(`Shader program ${this.name} link fail: ${buf}`);
            }                                            
            this.updateShaderData();    
        } 
        updateShaderData() {
            // Uniform data
            this.uniforms = {};
            const countUniforms = this.rnd.gl.getProgramParameter(this.prg, this.rnd.gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < countUniforms; i++) {
            const info = this.rnd.gl.getActiveUniform(this.prg, i);
            this.uniforms[info.name] = {
                name: info.name,
                type: info.type,
                size: info.size,
                loc: this.rnd.gl.getUniformLocation(this.prg, info.name),
            };
            }

            // Attributes
            this.attrs = {};
            const countAttrs = this.rnd.gl.getProgramParameter(this.prg, this.rnd.gl.ACTIVE_ATTRIBUTES);
            for (let i = 0; i < countAttrs; i++) {
                const info = this.rnd.gl.getActiveAttrib(this.prg, i);
                this.attrs[info.name] = {
                    name: info.name,
                    type: info.type,
                    size: info.size,
                    loc: this.rnd.gl.getAttribLocation(this.prg, info.name),
                };
            }
            // Uniform blocks
            this.uniformBlocks = {};
            const countUniformBlocks = this.rnd.gl.getProgramParameter(this.prg, this.rnd.gl.ACTIVE_UNIFORM_BLOCKS);
            for (let i = 0; i < countUniformBlocks; i++) {
                const block_name = this.rnd.gl.getActiveUniformBlockName(this.prg, i);
                const index = this.rnd.gl.getUniformBlockIndex(this.prg, block_name, );
                this.uniformBlocks[block_name] =  {
                    name: block_name,
                    size: this.rnd.gl.getActiveUniformBlockParameter(this.prg, index, this.rnd.gl.UNIFORM_BLOCK_DATA_SIZE),
                    index: this.rnd.gl.getUniformBlockIndex(this.prg, block_name),
                    bind: this.rnd.gl.getActiveUniformBlockParameter(this.prg, index, this.rnd.gl.UNIFORM_BLOCK_BINDING),
                };
            }
        }
        apply() {
            if (this.prg != null) {
                this.rnd.gl.useProgram(this.prg);
                return true;
            }
            return false;
        }
    }

    function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
    }

    class Texture {
        constructor(gl, url) {
            this.gl = gl;
            this.url = url;

            this.tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.tex);

            this.level = 0;
            this.internalFormat = gl.RGBA;
            this.width = 1;
            this.height = 1;
            this.border = 0;
            this.srcFormat = gl.RGBA;
            this.srcType = gl.UNSIGNED_BYTE;

            const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
            gl.texImage2D(
                gl.TEXTURE_2D,
                this.level,
                this.internalFormat,
                this.width,
                this.height,
                this.border,
                this.srcFormat,
                this.srcType,
                pixel,
            );

            this.image = new Image();
            this.image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.tex);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    this.level,
                    this.internalFormat,
                    this.srcFormat,
                    this.srcType,
                    this.image,
                );
                
                if (isPowerOf2(this.image.width) && isPowerOf2(this.image.height)) {
                    // Yes, it's a power of 2. Generate mips.
                    this.gl.generateMipmap(this.gl.TEXTURE_2D);
                } else {
                    // No, it's not a power of 2. Turn off mips and set
                    // wrapping to clamp to edge
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                }
            };
                
            this.image.src = url;
        }
    }

    class Material {
        constructor(shd, ka, kd, ks, ph, trans) {
            this.shd = shd;

            this.ubo = new UniformBlock(shd.rnd, "Material", 16 * 4, 2);
            this.ubo.update(0, new Float32Array([ka.x, ka.y, ka.z, 0, kd.x, kd.y, kd.z, trans, ks.x, ks.y, ks.z, ph, 0, 0, 0, 0]));

            this.textures = [null, null, null, null];
            this.textureFlags = [false, false, false, false];
        }
        setTexture(ind, tex) {
            if (ind >= this.textureFlags.length)
                return;

            this.textures[ind] = tex;
            this.textureFlags = true;

            this.ubo.update(16 * 3, new Float32Array([this.textureFlags]));
        }
        apply() {
            if (this.shd.apply()) {
                this.ubo.apply(this.shd);

                for (let i = 0; i < this.textureFlags.length; i++) {
                    if (!this.textureFlags[i])
                        continue;

                    rnd.gl.activeTexture(this.shd.rnd.gl.TEXTURE0 + i);
                    rnd.gl.bindTexture(this.shd.rnd.gl.TEXTURE_2D, this.textures[i].tex);
                }
                return true;
            }
            return false;
        }
    }

    let 
      rnd$1, prim, shd, mtl, prim1, mtl1;
    let tex;

    function init() {
      rnd$1 = new Render(document.getElementById("myCan"));

      let pl = new Plat([]);
      pl = pl.createDodecahedron();

      shd = new Shader(rnd$1, "default");
      mtl = new Material(shd, vec3(0, 0, 0), vec3(1, 0, 1), vec3(1, 1, 1), 10, 1);

      tex = new Texture(rnd$1.gl, "./bin/textures/a.png");
      mtl.setTexture(0, tex);
      /*
      prim = new Prim(mtl, [], []);// pl.createPrim(mtl);
      prim.loadOBJ("bin/models/untitled1.obj");
      */

      prim = pl.createPrim(mtl);

      pl = new Plat([]);
      pl = pl.createIcosahedron();

      mtl1 = new Material(shd, vec3(0, 0, 0), vec3(0, 0, 1), vec3(1, 1, 1), 10, 1);

      prim1 = pl.createPrim(mtl1);
    }

    // Initialization
    window.addEventListener("load", () => {
      init();

      const draw = () => {
        rnd$1.renderStart();

        const date = new Date();
        let t = date.getMinutes() * 60 +
                date.getSeconds() +
                date.getMilliseconds() / 1000;
        prim.world = scale(vec3(0.8)).mul(rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(-1, Math.sin(t * 2), -6))));
        prim.draw(rnd$1);
        prim1.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(1, Math.sin(t * 4) * 2, -6)));
        prim1.draw(rnd$1);
        window.requestAnimationFrame(draw);
      };
      draw();
    });

})();
