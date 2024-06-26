(function (exports) {
  'use strict';

  console.log("mylib.js loaded");

  let
    canvas,
    gl,
    timeLoc,
    mousePosLoc,
    mousePos = {x: 0, y: 0}, lastMousePos, start = {x: -1, y: -1}, end = {x: 1, y: 1};  

  // WebGL initialization function.
  function init()
  {
    canvas = document.getElementById("myCan");
    gl = canvas.getContext("webgl2");
    gl.clearColor(0.30, 0.47, 0.8, 1);
    
    // Shader creation
    let vs_txt =
    `#version 300 es
  precision highp float;
  in vec3 InPosition;
    
  out vec2 DrawPos;
  uniform float Time;
  
  void main( void )
  {
    gl_Position = vec4(InPosition, 1);
    DrawPos = InPosition.xy;
  }
  `;
    let fs_txt =
    `#version 300 es
  precision highp float;
  out vec4 OutColor;
  
  in vec2 DrawPos;
  uniform float Time;
  uniform vec4  Coords;
  
  void main( void )
  {
    vec2 C = vec2(0.5, 0.32); // vec2(-abs(sin(Time) * 0.5) * 0.5 + 0.5, 0.32);
    vec2 MouseFrame = vec2(0.8);
    
    vec2 Start = Coords.xy, End = Coords.zw;

    vec2 Z;
    Z.x = (DrawPos.x + 1.0) * 0.5 * (End.x - Start.x) + Start.x;
    Z.y = (DrawPos.y + 1.0) * 0.5 * (End.y - Start.y) + Start.y;
    vec2 Zn = Z;
    int n = -1;
    int max_n = 200;

    while (n++ < max_n && Zn.x * Zn.x + Zn.y * Zn.y <= 4.0)
    {
      Zn = vec2(Zn.x * Zn.x - Zn.y * Zn.y, Zn.x * Zn.y + Zn.x * Zn.y);
      Zn = Zn + C;
    }
    float c = (float(n) / float(max_n)) * 2.0; 
    OutColor = vec4(c, c * 0.5, c * 0.8, 1.0);
  }
  `;
    let
      vs = loadShader(gl.VERTEX_SHADER, vs_txt),
      fs = loadShader(gl.FRAGMENT_SHADER, fs_txt),
      prg = gl.createProgram();
    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
      let buf = gl.getProgramInfoLog(prg);
      console.log('Shader program link fail: ' + buf);
    }                                            
    
    // Vertex buffer creation
    const size = 1;
    const vertexes = [-size, size, 0, -size, -size, 0, size, size, 0, size, -size, 0];
    const posLoc = gl.getAttribLocation(prg, "InPosition");
    let vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexes), gl.STATIC_DRAW);
    if (posLoc != -1) {
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(posLoc);
    }
    
    // Uniform data
    timeLoc = gl.getUniformLocation(prg, "Time");
    mousePosLoc = gl.getUniformLocation(prg, "Coords");
    
    gl.useProgram(prg);
  } // End of 'init' function

  // Load and compile shader function
  function loadShader(shaderType, shaderSource) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let buf = gl.getShaderInfoLog(shader);
      console.log('Shader compile fail: ' + buf);
    }                                            
    return shader;
  } // End of 'loadShader' function

  // WebGL rendering function.
  function render()
  {
    gl.clear(gl.COLOR_BUFFER_BIT);
                                                 
    if (timeLoc != -1) {
        const date = new Date();
        let t = date.getMinutes() * 60 +
                date.getSeconds() +
                date.getMilliseconds() / 1000;
    
        gl.uniform1f(timeLoc, t);
    }
    if (mousePosLoc != -1) {
      gl.uniform4f(mousePosLoc, start.x, start.y, end.x, end.y);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  } // End of 'render' function

  // On click calling function.
  function onClick(event) {
    let rect = canvas.getBoundingClientRect();
    let width = rect.right - rect.left + 1;
    let height = rect.bottom - rect.top + 1;

    lastMousePos = {x: mousePos.x, y: mousePos.y};

    mousePos.x = (event.clientX - rect.left) / width;
    mousePos.y = -(event.clientY - rect.top) / height + 1;
    
    if (event.buttons == 1)
    {
      let size = {x: end.x - start.x, y: end.y - start.y};

      start.x -= (mousePos.x - lastMousePos.x) * size.x;
      start.y -= (mousePos.y - lastMousePos.y) * size.y;
      end.x -= (mousePos.x - lastMousePos.x) * size.x;
      end.y -= (mousePos.y - lastMousePos.y) * size.y;
    }
  } // End of 'onClick' function

  function zoom(dir) {

    let mp = {x: mousePos.x * (end.x - start.x) + start.x, y: mousePos.y * (end.y - start.y) + start.y};
    let d1x = -dir * 0.1 * (mp.x - start.x);
    let d1y = -dir * 0.1 * (mp.y - start.y);
    let d2x = -dir * 0.1 * (end.x - mp.x);
    let d2y = -dir * 0.1 * (end.y - mp.y);

    start.x += d1x;
    start.y += d1y;
    end.x -= d2x;
    end.y -= d2y;
  } 

  window.addEventListener("load", () => {
    init();
    const draw = () => {
        render();
        window.requestAnimationFrame(draw);
    };
    draw();
  });

  window.addEventListener("wheel", (e) => {
    zoom(e.deltaY / Math.abs(e.deltaY));
  });

  window.addEventListener("mousemove", (e) => {
    onClick(e);
  });

  exports.init = init;
  exports.onClick = onClick;
  exports.render = render;

  return exports;

})({});
