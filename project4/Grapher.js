// Grapher.js
// Vertex shader program

var vertex_shader_source =
'attribute vec4 vPosition;\n' +
'uniform   mat4 Projection;\n' +
'uniform   mat4 Model;\n' +
'attribute vec4 v_Color;\n' +
'varying mediump vec4 fColor;\n' +
'void main() {\n' +
'   fColor = v_Color;\n' +
'   fColor = (vPosition + 1.0) / 2.0;\n' +
'   gl_Position  = Projection * Model * vPosition;\n' +
'}\n';

var fragment_shader_source =
'uniform mediump vec4 light;\n' +
'varying mediump vec4 fColor;\n' +
'void main() {\n' +
'    gl_FragColor = fColor * light;\n' +
'}\n';

var canvas;
var gl;

var vertexBuffer;
var trianglesBuffer;
var rowLineBuffer;
var columnLinesBuffer;

var rotateY;
var rotateX;

var n      = 8;                // The number of vertices
var nVer   = 3 * n * n;         // The size of the verticies array
var nTri   = 6 * (n-1) * (n-1);   // The size of the triangles array
var nLines = 2 * n * (n-1);   // The size of the lines arrays


var vertices    = new Float32Array(nVer);     // Create verticies array
var triangles   = new Uint16Array(nTri);     // Create the triangles array
var rowLines    = new Uint16Array(nLines); // Create the rows array
var columnLines = new Uint16Array(nLines); // Create the columns array

function init() {
    
    //Fill the arrays
    for (var r = 0; r < n; r++)
        for (var c = 0; c < n; c++){
            var x = ((2 * c) / (n - 1)) - 1;
            var z = ((2 * r) / (n - 1)) - 1;
            var y = 1 - (x * x) - (z * z);
            
            vertices[(r * n + c) * 3]     = x; // x
            vertices[(r * n + c) * 3 + 1] = y; // y
            vertices[(r * n + c) * 3 + 2] = z; // z
        }
    for (var r = 0; r < (n - 1); r++)
        for (var c = 0; c < (n - 1); c++){
            var izero  = (r + 0) * n + (c + 0);
            var ione   = (r + 1) * n + (c + 0);
            var itwo   = (r + 0) * n + (c + 1);
            var ithree = (r + 1) * n + (c + 1);
            
            triangles [(r * (n-1) + c) * 6 ]    = izero; //i0
            triangles [(r * (n-1) + c) * 6 + 1] = ione; //i1
            triangles [(r * (n-1) + c) * 6 + 2] = itwo; //i2
            triangles [(r * (n-1) + c) * 6 + 3] = itwo; //i3
            triangles [(r * (n-1) + c) * 6 + 4] = ione; //i4
            triangles [(r * (n-1) + c) * 6 + 5] = ithree; //i5
        }
    
    for (var r = 0; r < n; r++)
        for (var c = 0; c < (n - 1); c++){
            rowLines[(r * n + c) * 2]     = (r + 0) * n + (c + 0); //i0
            rowLines[(r * n + c) * 2 + 1] = (r + 0) * n + (c + 1); //i2
        }
    
    for (var r = 0; r < (n - 1); r++)
        for (var c = 0; c < n; c++){
            columnLines[(r * n + c) * 2]     = (r + 0) * n + (c + 0); //i0
            columnLines[(r * n + c) * 2 + 1] = (r + 1) * n + (c + 0); //i1
        }
    
    
    // Initialize the WebGL context.
    canvas = document.getElementById('webgl');
    gl     = getWebGLContext(canvas, false);
    
    // Initialize the program object and its uniforms.
    initShaders(gl, vertex_shader_source, fragment_shader_source);
    
    // Initialize vertex and index buffer objects.
    vertexBuffer        = gl.createBuffer();
    trianglesBuffer     = gl.createBuffer();
    rowLinesBuffer      = gl.createBuffer();
    columnLinesBuffer   = gl.createBuffer();
    
    LightLocation = gl.getUniformLocation(gl.program, 'light');
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rowLinesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rowLines, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, columnLinesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, columnLines, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, trianglesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);
    
    
    // Link the shader attributes to the vertex buffer object.
    var vPositionLocation = gl.getAttribLocation(gl.program, 'vPosition');
    
    gl.vertexAttribPointer(vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(vPositionLocation);
    
    // Set up to render.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    rotateY = 0;
    rotateX = 0;
    
    draw();
}

function move (event){
    if(event.which == 1){
        console.log(event.movementX + ' ' + event.movementY);
        rotateY = rotateY + event.movementX;
        rotateX = rotateX + event.movementY;
        
        if (rotateX > 90){
            rotateX = 90;
        }
        if (rotateX < -90){
            rotateX = -90;
        }
        if (rotateY > 180){
            rotateY -= 360;
        }
        if (rotateY < -180){
            rotateY += 360;
        }
    }
}

function draw() {
    
    // Handle the GUI.
    var z = parseFloat(document.getElementById("zinput").value);
    
    document.getElementById("zoutput").innerHTML = z;
    
    // Compute the transform.
    var ProjectionLocation = gl.getUniformLocation(gl.program, 'Projection');
    var Projection = new Matrix4();
    Projection.setPerspective(45, 1, 1, 10);
    gl.uniformMatrix4fv(ProjectionLocation, false, Projection.elements);
    
    var ModelLocation = gl.getUniformLocation(gl.program, 'Model');
    var Model = new Matrix4();
    Model.setTranslate(0, 0, -z);
    Model.rotate(rotateX, 1, 0, 0);
    Model.rotate(rotateY, 0, 1, 0);
    
    gl.uniformMatrix4fv(ModelLocation, false, Model.elements);
    
    // Clear the screen.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Draw the triangles in color.
    gl.uniform4f(LightLocation, 1.0, 1.0, 1.0, 1.0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, trianglesBuffer);
    gl.drawElements(gl.TRIANGLES, nTri, gl.UNSIGNED_SHORT, 0);
    
    // Draw the lines in black.
    gl.uniform4f(LightLocation, 0.0, 0.0, 0.0, 1.0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rowLinesBuffer);
    gl.drawElements(gl.LINES, rowLines.length, gl.UNSIGNED_SHORT, 0);
    
    gl.uniform4f(LightLocation, 0.0, 0.0, 0.0, 1.0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, columnLinesBuffer);
    gl.drawElements(gl.LINES, columnLines.length, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(draw);
}
