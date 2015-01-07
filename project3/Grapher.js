// Grapher.js
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'varying mediump vec4 v_Color;\n' +
    'void main() {\n' +
    '  v_Color = (a_Position + 1.0) / 2.0;\n' +
    '  gl_Position = a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'varying mediump vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Draw a function
    gl.drawElements(gl.TRIANGLES, 6 * (n - 1) * (n - 1), gl.UNSIGNED_SHORT, 0);

}

function initVertexBuffers(gl) {
    
    var n = 16; // The number of vertices
    var nVer = 3 * n * n; // The size of the verticies array

    // Create and fill verticies array
    var vertices = new Float32Array(nVer);
    for (var r = 0; r < n; r++)
        for (var c = 0; c < n; c++){
            var x = ((2 * c) / (n - 1)) - 1;
            var z = ((2 * r) / (n - 1)) - 1;
            var y = 1 - (x * x) - (z * z);
            
            vertices[(r * n + c) * 3]     = x; // x
            vertices[(r * n + c) * 3 + 1] = y; // y
            vertices[(r * n + c) * 3 + 2] = z; // z
        }
    
    // Create and fill the triangles array
    var nTri = 6 * (n - 1) * (n - 1);
    var triangles = new Uint16Array(nTri);
    for (var r = 0; r < (n - 1); r++)
        for (var c = 0; c < (n - 1); c++){
            triangles [(r * n + c) * 6 ]    = (r + 0) * n + (c + 0); //i0
            triangles [(r * n + c) * 6 + 1] = (r + 1) * n + (c + 0); //i1
            triangles [(r * n + c) * 6 + 2] = (r + 0) * n + (c + 1); //i2
            triangles [(r * n + c) * 6 + 3] = (r + 0) * n + (c + 1); //i3
            triangles [(r * n + c) * 6 + 4] = (r + 1) * n + (c + 0); //i4
            triangles [(r * n + c) * 6 + 5] = (r + 1) * n + (c + 1); //i5
        }
 
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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
    
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    
    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 12, 0);

    //Enable the assigment to a_Position
    gl.enableVertexAttribArray(a_Position);
    
    return n;
}