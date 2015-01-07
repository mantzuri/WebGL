// Viewer.js

// Tumble Interaction globals
var modelRotationX    = 0;
var modelRotationY    = 0;
var modelTranslationZ = 0;

var modelTexture;
var texCoords;

var lightPositionX;
var lightPositionY;
var lightPositionZ;

var dragging = false;
var lastClientX = 0;
var lastClientY = 0;
var dX;
var dY;

var projectionMatrixLocation;
var modelMatrixLocation;
var lightPositionLocation; // one of these need to go.
//var lightDirectionLocation; //This one!
var lightColorLocation;


var projectionMatrix = new Matrix4();
var modelMatrix      = new Matrix4();

var canvas;
var gl;

function init(){
    canvas = document.getElementById('webgl');
    gl     = getWebGLContext(canvas, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    //Shader initialization
    initShaders(gl, document.getElementById("vertexShader").text,
                document.getElementById("fragmentShader").text);
    
    
    //Buffer initialization
    vertexPositionLocation  = gl.getAttribLocation(gl.program, "vertexPosition");
    vertexNormalLocation    = gl.getAttribLocation(gl.program, "vertexNormal");
    gl.enableVertexAttribArray(vertexPositionLocation);
    gl.enableVertexAttribArray(vertexNormalLocation);
    
    projectionMatrixLocation = gl.getUniformLocation(gl.program, "projectionMatrix");
    modelMatrixLocation      = gl.getUniformLocation(gl.program, "modelMatrix");
    lightPositionLocation   = gl.getUniformLocation(gl.program, "lightPosition");
    lightColorLocation       = gl.getUniformLocation(gl.program, "lightColor");
    vertexTexCoordLocation   = gl.getAttribLocation (gl.program, "vertexTexCoord");
    
    gl.enableVertexAttribArray(vertexTexCoordLocation);
    
    
    positionArray = new Float32Array(flatten(vertices));
    normalArray   = new Float32Array(flatten(normals));
    triangleArray = new Uint16Array (flatten(triangles));
    texCoordArray = new Float32Array(flatten(texCoords));
    
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);
    
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
    
    triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);
    
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,texCoordArray,gl.STATIC_DRAW);
    
    setupTexture();
    
    slider();
}

function loadTexture(image, texture){
    
    modelTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, modelTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    requestAnimationFrame(draw);
}

function setupTexture(){
    
    modelImage = new Image();
    
    modelImage.crossOrigin = "anonymous"
    modelImage.src = "http://i.imgur.com/7thU1gD.jpg";
    var textureLocation = gl.getUniformLocation(gl.program, "modelTexture");
    
    gl.uniform1i(textureLocation, 0);
    
    modelImage.onload = function(){
        loadTexture(modelImage, modelTexture);
        
    }
}

//Rendering
function draw() {
    
    projectionMatrix.setPerspective(45, 1, 1, 10);
    modelMatrix.setTranslate(0, 0, -modelTranslationZ);
    modelMatrix.rotate(modelRotationX, 1, 0, 0);
    modelMatrix.rotate(modelRotationY, 0, 1, 0);
    
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements);
    gl.uniform4f(lightPositionLocation, lightPositionX, lightPositionY, lightPositionZ, 1.0);
    
    gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(vertexTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);
    
}

function onMouseDown(event){
    dragging = true;
    lastClientX = event.clientX;
    lastClientY = event.clientY;
}

function onMouseUp(event){
    dragging = false;
}

function onMouseMove(event){
    if(dragging){
        dX = event.clientX - lastClientX;
        dY = event.clientY - lastClientY;
        
        modelRotationY = modelRotationY + dX;
        modelRotationX = modelRotationX + dY;
        
        if (modelRotationX > 90.0)
            modelRotationX = 90.0;
        if (modelRotationX < -90.0)
            modelRotationX = -90.0;
        
        requestAnimationFrame(draw);
        
    }
    lastClientX = event.clientX;
    lastClientY = event.clientY;
}

function slider() {
    
    modelTranslationZ = parseFloat(document.getElementById("modelTranslationZInput").value);
    lightPositionX    = parseFloat(document.getElementById("lightPositionXInput").value);
    lightPositionY    = parseFloat(document.getElementById("lightPositionYInput").value);
    lightPositionZ    = parseFloat(document.getElementById("lightPositionZInput").value);
    
    document.getElementById ("modelTranslationZOutput").innerHTML = modelTranslationZ;
    document.getElementById ("lightPositionXOutput").innerHTML = lightPositionX;
    document.getElementById ("lightPositionYOutput").innerHTML = lightPositionY;
    document.getElementById ("lightPositionZOutput").innerHTML = lightPositionZ;
    
    requestAnimationFrame(draw);
}

//Flatten arrays
function flatten(a) {
    return a.reduce(function (b, v) { b.push.apply(b, v); return b }, [])
}