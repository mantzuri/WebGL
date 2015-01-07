// Grapher.js
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'void main() {\n' +
    '  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\n' +
    '}\n';

function main() {
    //Retrieve <canvas> elements
    var canvas = document.getElementById('webgl');
    
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed to get the rendering context for WebGl');
        return;
    }
    
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    
    // Set the positions of vertices
    var n = initVertexBuffers(gl);
    if (n < 0) {
         console.log('Failed to set the positions of the vertices');
         return;
         }
    // Set the clear color and enable the hidden surface removal
    gl.clearColor(0.0, 0.502, 0.0, 1.0);
    
    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVertexBuffers(gl) {
    var n = 9; // The number of vertices
    
    // Create and fill verticies array
    var vertices = new Float32Array([
        0.000,  0.850,   -0.375,  0.000,   0.375,  0.000, // Top triagnle
       -0.375, -0.000,   -0.750, -0.850,   0.000, -0.850, // Left triangle
        0.375,  0.000,    0.000, -0.850,   0.750, -0.850  // Right triangle
    ]);

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object ');
        return -1;
    }
    
    var triangleBuffer = gl.createBuffer();
    if (!triangleBuffer) {
        console.log('Failed to create the buffer object ');
        return -1;
    }
    // Bind the buffer object to target and write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    
    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    //Enable the assigment to a_Position
    gl.enableVertexAttribArray(a_Position);
    
    return n;
}