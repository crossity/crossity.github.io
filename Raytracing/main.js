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

    class Target {
        constructor(rnd, width, height) {
            this.texture = rnd.gl.createTexture();
            rnd.gl.bindTexture(rnd.gl.TEXTURE_2D, this.texture);

            // define size and format of level 0
            const level = 0;
            const internalFormat = rnd.gl.RGBA;
            const border = 0;
            const format = rnd.gl.RGBA;
            const type = rnd.gl.UNSIGNED_BYTE;
            const data = null;

            this.rnd = rnd;

            rnd.gl.texImage2D(rnd.gl.TEXTURE_2D, level, internalFormat,
                            width, height, border,
                            format, type, data);
            
            // set the filtering so we don't need mips
            rnd.gl.texParameteri(rnd.gl.TEXTURE_2D, rnd.gl.TEXTURE_MIN_FILTER, rnd.gl.LINEAR);
            rnd.gl.texParameteri(rnd.gl.TEXTURE_2D, rnd.gl.TEXTURE_WRAP_S, rnd.gl.CLAMP_TO_EDGE);
            rnd.gl.texParameteri(rnd.gl.TEXTURE_2D, rnd.gl.TEXTURE_WRAP_T, rnd.gl.CLAMP_TO_EDGE);

            this.fbo = rnd.gl.createFramebuffer();
            rnd.gl.bindFramebuffer(rnd.gl.FRAMEBUFFER, this.fbo);

            rnd.gl.framebufferTexture2D(rnd.gl.FRAMEBUFFER, rnd.gl.COLOR_ATTACHMENT0, rnd.gl.TEXTURE_2D, this.texture, level);
            rnd.gl.bindTexture(rnd.gl.TEXTURE_2D, null);
        }
        apply() {
            this.rnd.gl.bindFramebuffer(this.rnd.gl.FRAMEBUFFER, this.fbo);
        }
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
                type: this.rnd.gl.FRAGMENT_SHADER,
                name: "frag",
                src: "",
            },
            {
                id: null,
                type: this.rnd.gl.VERTEX_SHADER,
                name: "vert",
                src: "",
            },
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
            let loaded = this.shd.apply();

            if (!loaded)
                return false;

            if (this.shd.uniforms["Time"] != undefined)
                this.shd.rnd.gl.uniform1f(this.shd.uniforms["Time"].loc, this.shd.rnd.timer.globalTime);
            if (this.shd.uniforms["DeltaTime"] != undefined)
                this.shd.rnd.gl.uniform1f(this.shd.uniforms["DeltaTime"].loc, this.shd.rnd.timer.globalDeltaTime);

            if (this.shd.apply() && this.shd.uniformBlocks[Material] != undefined) {
                this.ubo.apply(this.shd);

                this.shd.rnd.gl;

                for (let i = 0; i < this.textureFlags.length; i++) {
                    if (!this.textureFlags[i])
                        continue;

                    this.shd.rnd.gl.activeTexture(this.shd.rnd.gl.TEXTURE0 + i);
                    this.shd.rnd.gl.bindTexture(this.shd.rnd.gl.TEXTURE_2D, this.textures[i].tex);
                }
                
                return true;
            }
            return false;
        }
    }

    class Timer {
        constructor() {
            this.getTime = () => {
                const date = new Date();
                let t =
                  date.getMilliseconds() / 1000.0 +
                  date.getSeconds() +
                  date.getMinutes() * 60;
                return t;
            };

            this.oldGlobalTime = this.getTime();
            this.frameCounter = 0;
            this.isPause = false;
            this.localTime = this.startTime = this.oldGlobalTime;
            this.globalTime = this.oldGlobalTime;
            this.globalDeltaTime = 0;
            this.localTime = this.globalTime;
            this.localDeltaTime = 0;
            this.pauseTime = 0;
        }

        update() {
            this.globalTime = this.getTime();
            this.globalDeltaTime = this.globalTime - this.oldGlobalTime;

            if (this.isPause) {
                this.localDeltaTime = 0;
                this.pauseTime += this.globalTime - this.oldGlobalTime;
            } else {
                this.localDeltaTime = this.globaLDeltaTime;
                this.localTime = this.globalTime - this.pauseTime - this.startTime;
            }

            this.oldGlobalTime = this.globalTime;
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

            this.canvas = canvas;

            this.gl = canvas.getContext("webgl2");
            this.width = rect.right - rect.left;
            this.height = rect.bottom - rect.top;

            this.gl.enable(this.gl.DEPTH_TEST);

            this.cameraUbo = new UniformBlock(this, "Camera", 80, 1);

            this.gl.clearColor(0.5, 0.4, 1, 1);

            this.targets = [new Target(this, this.width, this.height), new Target(this, this.width, this.height)];

            this.curTarget = 0;

            // Setup camera
            this.camera = new Camera(this.width, this.height, vec3(0, 0, 0), vec3(0, 0, -1), vec3(0, 1, 0));

            this.shd = new Shader(this, "onscreen");
            this.mtl = new Material(this.shd, vec3(0, 0, 0), vec3(0, 0, 1), vec3(1, 1, 1), 10, 1);

            this.prim = new Prim(this.mtl, [vertex(vec3(-1, -1, 0.2)), vertex(vec3(3, -1, 0.2)), vertex(vec3(-1, 3, 0.2))], [0, 1, 2]);

            // Timer initialization
            this.timer = new Timer();
        } // End of 'constructor' function

        // WebGL rendering function.
        renderStart() {
            this.timer.update();

            // this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

            this.cameraUbo.update(0, new Float32Array([
                this.camera.loc.x, this.camera.loc.y, this.camera.loc.z, this.camera.projDist, 
                this.camera.dir.x, this.camera.dir.y, this.camera.dir.z, this.camera.projSize,
                this.camera.right.x, this.camera.right.y, this.camera.right.z, 0,
                this.camera.up.x, this.camera.up.y, this.camera.up.z, 0,
                this.camera.width, this.camera.height, 0, 0
            ]));

            this.targets[this.curTarget].apply();
            // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        } // End of 'render' function

        renderEnd() {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.targets[this.curTarget].texture);
            this.gl.disable(this.gl.DEPTH_TEST);
            this.prim.draw();
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

            this.curTarget = (this.curTarget + 1) % 2;
        }
    }

    class RaymarchingObject {
        constructor(mtl) {
            this.prim = new Prim(mtl, [vertex(vec3(-1, -1, 0.5)), vertex(vec3(3, -1, 0.5)), vertex(vec3(-1, 3, 0.5))], [0, 1, 2]);
        }
    }

    let rnd;
    let rm, rmshd, rmmtl;

    let framesStill = -1;

    function init() {
      rnd = new Render(document.getElementById("myCan"));

      rmshd = new Shader(rnd, "raytracing");
      rmmtl = new Material(rmshd, vec3(0, 0, 0), vec3(0, 0, 1), vec3(1, 1, 1), 10, 1);

      rm = new RaymarchingObject(rmmtl);
    }

    // Initialization
    window.addEventListener("load", () => {
      init();

      const draw = () => {
        rnd.renderStart();
        /*
        prim.world = scale(vec3(0.8)).mul(rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(-1, Math.sin(t * 2), -6))));
        prim.draw(rnd);
        prim1.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(1, Math.sin(t * 4) * 2, -6)))
        prim1.draw(rnd);
        */

        rnd.gl.disable(rnd.gl.DEPTH_TEST);

        rnd.gl.activeTexture(rnd.gl.TEXTURE0);
        rnd.gl.bindTexture(rnd.gl.TEXTURE_2D, rnd.targets[(rnd.curTarget + 1) % 2].texture);

        if (rmshd.apply() && rmshd.uniforms["uSamplePart"] != undefined)
          rmshd.rnd.gl.uniform1f(rmshd.uniforms["uSamplePart"].loc, 1 / framesStill);
        rm.prim.draw(rnd);
        rnd.gl.enable(rnd.gl.DEPTH_TEST);
        rnd.gl.bindTexture(rnd.gl.TEXTURE_2D, null);

        rnd.renderEnd();
        window.requestAnimationFrame(draw);

        framesStill++;
      };
      draw();
    });

    let mousePos = {x: 0, y: 0}, lastMousePos;

    let sens = 2, speed = 5;

    let anglex = 0, angley = 0;

    function mouseDrag(e) {
      let rect = document.getElementById("myCan").getBoundingClientRect();
      let width = rect.right - rect.left + 1;
      let height = rect.bottom - rect.top + 1;

      lastMousePos = {x: mousePos.x, y: mousePos.y};

      mousePos.x = (e.clientX - rect.left) / width;
      mousePos.y = -(e.clientY - rect.top) / height + 1;

      if (e.buttons == 1) {
        let delta = {x: mousePos.x - lastMousePos.x, y: mousePos.y - lastMousePos.y};

        anglex += delta.y * sens;
        angley -= delta.x * sens;

        let at = vec3(0, 0, -1).pointTransform(rotate(anglex, vec3(1, 0, 0)));
        at = at.pointTransform(rotate(angley, vec3(0, 1, 0)));
        // at = at.pointTransform(rotate(-delta.x * sens, vec3(0, 1, 0))).add(rnd.camera.loc);

        at = at.add(rnd.camera.loc);
        rnd.camera.update(rnd.camera.loc, at, vec3(0, 1, 0));

        framesStill = 1;
      }
    }

    window.addEventListener("mousemove", (e) => {
      mouseDrag(e);
    });

    document.addEventListener("keypress", (e) => {
      if (e.key == 'w') {
        framesStill = 1;
        let delta = rnd.camera.dir.mul(speed * rnd.timer.globalDeltaTime);
        rnd.camera.update(rnd.camera.loc.add(delta), rnd.camera.at.add(delta), vec3(0, 1, 0));
      }
      if (e.key == 's') {
        framesStill = 1;
        let delta = rnd.camera.dir.mul(-speed * rnd.timer.globalDeltaTime);
        rnd.camera.update(rnd.camera.loc.add(delta), rnd.camera.at.add(delta), vec3(0, 1, 0));
      }
    });

})();
