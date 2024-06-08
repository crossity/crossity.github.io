(function () {
    'use strict';

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

        frustum(left, right, bottom, top, near, far) {
            this.a = [
                [2 * near / (right - left), 0, 0, 0],
                [0, 2 * near / (top - bottom), 0, 0],
                [(right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1],
                [0, 0, -2 * near * far / (far - near), 0]
            ];
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

            // Shader creation
            let vs_txt =
            `#version 300 es
        precision highp float;
        in vec3 InPosition;
        in vec3 InNormal;
            
        out vec3 DrawPos;
        out vec3 DrawNormal;
        uniform float Time;
        uniform mat4 MatWVP;
        uniform mat4 MatW;
        
        void main( void )
        {
            DrawPos = vec3(MatW * vec4(InPosition, 1));
            gl_Position = MatWVP * vec4(InPosition, 1);
            DrawNormal = mat3(transpose(inverse(MatW))) * InNormal;
        }
        `;
            let fs_txt =
            `#version 300 es
        precision highp float;

        in vec3 DrawNormal;
        in vec3 DrawPos;
        out vec4 OutColor;
        
        uniform float Time;
        
        void main( void )
        {
            vec3 color = vec3(1.0, 0.1, 8.0);
            vec3 N = normalize(DrawNormal);
            N = faceforward(N, normalize(DrawPos), N);

            float d = max(0.1, dot(normalize(vec3(-1, 1, 1)), normalize(N)));

            OutColor = vec4(color * d, 1.0);
        } 
        `;
            let
                vs = this.loadShader(this.gl.VERTEX_SHADER, vs_txt),
                fs = this.loadShader(this.gl.FRAGMENT_SHADER, fs_txt);
            this.prg = this.gl.createProgram();
            this.gl.attachShader(this.prg, vs); 
            this.gl.attachShader(this.prg, fs);
            this.gl.linkProgram(this.prg);
            if (!this.gl.getProgramParameter(this.prg, this.gl.LINK_STATUS)) {
                let buf = this.gl.getProgramInfoLog(this.prg);
                console.log('Shader program link fail: ' + buf);
            }                                            

            // Uniform data
            this.timeLoc = this.gl.getUniformLocation(this.prg, "Time");
            this.wvpLoc = this.gl.getUniformLocation(this.prg, "MatWVP");
            this.wLoc = this.gl.getUniformLocation(this.prg, "MatW");
            
            this.gl.useProgram(this.prg);
            this.gl.clearColor(0.5, 0.4, 1, 1);

            // Get matrixes
            this.projSize = 0.1;
            this.projDist = 0.1;
            this.farClip = 300;

            let rx = this.projSize;
            let ry = this.projSize;

            if (this.width >= this.height)
                rx *= this.width / this.height;
            else
                ry *= this.height / this.width;

            this.proj = mat4();
            this.proj.frustum(-rx * 0.5, rx * 0.5, -ry * 0.5, ry * 0.5, this.projDist, this.farClip);
        } // End of 'constructor' function

        // WebGL rendering function.
        render() { 
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
                                                        
            if (this.timeLoc != -1) {
                const date = new Date();
                let t = date.getMinutes() * 60 +
                        date.getSeconds() +
                        date.getMilliseconds() / 1000;
            
                this.gl.uniform1f(this.timeLoc, t);
            }
            // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        } // End of 'render' function
    }

    class _vertex {
        constructor(pos, norm) {
            this.pos = pos;
            this.norm = norm;
        }
    }

    function vertex(pos, norm) {
        return new _vertex(pos, vec3());
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

    class Prim {
        constructor(rnd, verts, inds) {
            let vtts = [], i = 0;

            for (let el of verts) {
                vtts[i++] = el.pos.x;
                vtts[i++] = el.pos.y;
                vtts[i++] = el.pos.z;
                vtts[i++] = el.norm.x;
                vtts[i++] = el.norm.y;
                vtts[i++] = el.norm.z;
            }
            const posLoc = rnd.gl.getAttribLocation(rnd.prg, "InPosition");        this.vertexArray = rnd.gl.createVertexArray();
            const normLoc = rnd.gl.getAttribLocation(rnd.prg, "InNormal");
            rnd.gl.bindVertexArray(this.vertexArray);
            this.vertexBuffer = rnd.gl.createBuffer();

            rnd.gl.bindBuffer(rnd.gl.ARRAY_BUFFER, this.vertexBuffer);
            rnd.gl.bufferData(rnd.gl.ARRAY_BUFFER, new Float32Array(vtts), rnd.gl.STATIC_DRAW);
            
            if (posLoc != -1) {
                rnd.gl.vertexAttribPointer(posLoc, 3, rnd.gl.FLOAT, false, 24, 0);
                rnd.gl.enableVertexAttribArray(posLoc);
                rnd.gl.vertexAttribPointer(normLoc, 3, rnd.gl.FLOAT, false, 24, 12);
                rnd.gl.enableVertexAttribArray(normLoc);
            }

            this.indexBuffer = rnd.gl.createBuffer();
            rnd.gl.bindBuffer(rnd.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            rnd.gl.bufferData(rnd.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(inds), rnd.gl.STATIC_DRAW);

            this.numOfElements = inds.length;

            this.world = mat4(1);
        }
        draw(rnd) {
            rnd.gl.bindVertexArray(this.vertexArray);
            rnd.gl.bindBuffer(rnd.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            rnd.gl.drawElements(rnd.gl.TRIANGLES, this.numOfElements, rnd.gl.UNSIGNED_INT, 0);
            if (rnd.wvpLoc != -1) {
                rnd.gl.uniformMatrix4fv(rnd.wvpLoc, false, new Float32Array([].concat(...(this.world.mul(rnd.proj)).a)));
            }
            if (rnd.wLoc != -1) {
                rnd.gl.uniformMatrix4fv(rnd.wLoc, false, new Float32Array([].concat(...(this.world.a))));
            }
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

        createPrim(rnd) {
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

            return new Prim(rnd, v, inds);
        }
    }

    let rnd, rnd1, rnd2, rnd3, rnd4;

    let prim, prim1, prim2, prim3, prim4;

    function init() {
      rnd = new Render(document.getElementById("myCan"));
      rnd1 = new Render(document.getElementById("myCan1"));
      rnd2 = new Render(document.getElementById("myCan2"));
      rnd3 = new Render(document.getElementById("myCan3"));
      rnd4 = new Render(document.getElementById("myCan4"));

      /*
      let verts = [
        vertex(vec3(-1, -1, z - 1)), vertex(vec3(-1, 1, z - 1)), vertex(vec3(1, 1, z - 1)), vertex(vec3(1, -1, z - 1)),
        vertex(vec3(-1, -1, z + 1)), vertex(vec3(-1, 1, z + 1)), vertex(vec3(1, 1, z + 1)), vertex(vec3(1, -1, z + 1)),
      ]
      let inds = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        0, 1, 4, 1, 4, 5,
        2, 6, 7, 2, 7, 3, 
        1, 5, 6, 1, 6, 2,
        0, 4, 7, 0, 7, 3
      ]
      */
     /*
      let verts = [
        vertex(vec3(-1, -1, 0), vec3(0, 0, 1)), vertex(vec3(-1, 1, 0), vec3(0, 0, 1)), vertex(vec3(1, 1, 0), vec3(0, 0, 1)), vertex(vec3(1, -1, 0), vec3(0, 0, 1))
      ]
      let inds = [
        0, 1, 2, 2, 3, 0
      ]

      autoNormals(verts, inds);

      prim = new Prim(rnd, verts, inds);
      */
      let pl = new Plat([]);
      pl = pl.createTetrohedron();
      prim = pl.createPrim(rnd);
      pl = pl.createCube();
      prim1 = pl.createPrim(rnd1);
      pl = pl.createOctahedron();
      prim2 = pl.createPrim(rnd2);
      pl = pl.createIcosahedron();
      prim3 = pl.createPrim(rnd3);
      pl = pl.createDodecahedron();
      prim4 = pl.createPrim(rnd4);
    }

    // Initialization
    window.addEventListener("load", () => {
      init();

      const draw = () => {
        rnd.render();
        const date = new Date();
        let t = date.getMinutes() * 60 +
                date.getSeconds() +
                date.getMilliseconds() / 1000;
        prim.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(0, Math.sin(t * 2), -6)));
        prim.draw(rnd);
        rnd1.render();
        prim1.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(0, Math.sin(t * 2), -6)));
        prim1.draw(rnd1);
        rnd2.render();
        prim2.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(0, Math.sin(t * 2), -6)));
        prim2.draw(rnd2);
        rnd3.render();
        prim3.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(0, Math.sin(t * 2), -6)));
        prim3.draw(rnd3);
        rnd4.render();
        prim4.world = rotate(t * 1, vec3(0, 1, 0)).mul(translate(vec3(0, Math.sin(t * 2), -6)));
        prim4.draw(rnd4);
        window.requestAnimationFrame(draw);
      };
      draw();
    });

})();
