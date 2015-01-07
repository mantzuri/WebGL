// Viewer.js

// Tumble Interaction globals
var modelRotationX = 0;
var modelRotationY = 0;
var modelTranslationZ = 3;

var draggin = false;
var lastClientX = 0;
var lastClientY = 0;

var canvas;
var gl;

var vertexShader;
var fragmentShader;
var vertexPosition;
var vertexNormal;

var projectionMatrixLocation;
var vertexNormalLocation;
var lightColorLocation;
var lightColorLocation;
var objectColorLocation;

var normals = [];

var projectionMatrix = new Matrix4();
var modelMatrix      = new Matrix4();

function init() {
    canvas = document.getElementById('webgl');
    gl     = getWebGLContext(canvas, false);
    initShaders(gl, document.getElementById("vertexShader").text,
                document.getElementById("fragmentShader").text);
    
    //Buffer initialization
    vertexPositionLocation = gl.getAttribLocation(gl.program, "vertexPosition");
    vertexNormalLocation   = gl.getAttribLocation(gl.program, "vertexNormal");
    gl.enableVertexAttribArray(vertexPositionLocation);
    gl.enableVertexAttribArray(vertexNormalLocation);
    
    projectionMatrixLocation = gl.getUniformLocation(gl.program, "projectionMatrix");
    modelMatrixLocation      = gl.getUniformLocation(gl.program, "modelMatrix");
    lightDirectionLocation   = gl.getUniformLocation(gl.program, "lightDirection");
    lightColorLocation       = gl.getUniformLocation(gl.program, "lightColor");
    objectColorLocation      = gl.getUniformLocation(gl.program, "objectColor");
    
    //Fill the normal array with zeros
    for(var i = 0; i < vertices.length; i++){
        normals.push([0, 0, 0]);
    }
    //Fill the triagles array
    for(var i = 0; i < triangles.length; i++){
        var i0 = triangles[i][0];
        var i1 = triangles[i][1];
        var i2 = triangles[i][2];
        
        a = normalize(sub(vertices[i1], vertices[i0]));
        b = normalize(sub(vertices[i2], vertices[i0]));
        
        var n = normalize(cross(a,b));
        
        normals[i0] = add(normals[i0], n);
        normals[i1] = add(normals[i1], n);
        normals[i2] = add(normals[i2], n);
    }
    //Fill the normals array
    for(var i = 0; i < normals.length; i++)
        normals[i] = normalize(normals[i]);
    
    positionArray = new Float32Array(flatten(vertices));
    normalArray   = new Float32Array(flatten(normals));
    triangleArray = new Uint16Array(flatten(triangles));
    
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);
    
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
    
    triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    draw();
}

function move (event){
    if(event.which == 1){
        modelRotationY = modelRotationY + event.movementX;
        modelRotationX = modelRotationX + event.movementY;
        
        if (modelRotationX > 90){
            modelRotationX = 90;
        }
        if (modelRotationX < -90){
            modelRotationX = -90;
        }
        if (modelRotationY > 180){
            modelRotationY -= 360;
        }
        if (modelRotationY < -180){
            modelRotationY += 360;
        }
    }
}

//Rendering
function draw() {
    modelTranslationZ = parseFloat(document.getElementById("zinput").value);
    document.getElementById("zoutput").innerHTML = modelTranslationZ;
    
    projectionMatrix.setPerspective(45, 1, 1, 10);
    modelMatrix.setTranslate(0, 0, -modelTranslationZ);
    modelMatrix.rotate(modelRotationX, 1, 0, 0);
    modelMatrix.rotate(modelRotationY, 0, 1, 0);
    
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements);
    gl.uniform3f(lightDirectionLocation, 0.0, 1.0, 1.0);
    gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0);
    gl.uniform3f(objectColorLocation, 0.8, 0.8, 0.8);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(draw);
}

function cross(a, b){
    return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]];
}

function add(a, b) {
    return [
            a[0] + b[0],
            a[1] + b[1],
            a[2] + b[2]];
      }

function sub(a, b) {
    return [
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]];
      }

function dot(a, b){
    var d =
    a[0] * b[0] +
    a[1] * b[1] +
    a[2] * b[2];
    return d;
}

function normalize(a) {
    var len = Math.sqrt(dot(a,a));
    return [
            a[0] / len,
            a[1] / len,
            a[2] / len];
}

//Flatten arrays
function flatten(a) {
    return a.reduce(function (b, v) { b.push.apply(b, v); return b }, [])
}