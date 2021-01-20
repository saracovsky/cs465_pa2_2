
var canvas;
var gl;
var program;

var projectionMatrix; 
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;
var movements;
var counter;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
//var head2Id = 1;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var array;
var tailid = 10;


var torsoHeight = 1.4;
var torsoWidth = 5.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.5;
var tailwidth = 1.0;
var tailheight = 5.0;

var numNodes = 11;
var numAngles = 12;
var angle = 0;

var theta = [0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 90, 90];
var thetasave= [0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 90, 90];


var numVertices = 24;

var stack = [];

var figure = [];

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var numTimesToSubdivide = 3;
var index = 0;

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------

function triangle(a, b, c) {
    console.log(pointsArray);
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     index += 3;
     
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();
    
    switch(Id) {
    
    case torsoId:
    
    
     m=  translate(0.0, 0.5, 0.0);
    m = mult(m, rotate(theta[torsoId], 0, 1, 0));
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId: 
  
    //case head2Id:
    

    m = translate(0.0, torsoHeight+0.5*headHeight, torsoHeight+0.5*headHeight);
    m = mult(m, rotate(theta[head1Id], 1, 0, -1.0))
   // m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    
    case leftUpperArmId:
    
    m = translate(-(upperArmWidth+2.0), torsoHeight, 2.0);
    m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:
    
    m = translate(upperArmWidth+2.0, torsoHeight, 2.0);
    m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;
    
    case leftUpperLegId:
    
    m = translate(-(lowerLegWidth+2.0), torsoHeight, -2.0);
    m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:
    
    m = translate(upperLegWidth+2.0, torsoHeight, -2.0);
    m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailid, rightLowerLegId );
    break;
    
    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;
    
    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;
    
    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;
    
    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    case tailid:
        m =translate(torsoHeight-2.5, torsoHeight/20-1.7, -torsoWidth/2);
        m = mult(m, rotate(theta[tailid], 1.0, 0.0, 0.0));
        figure[tailid] = createNode( m, tail, null, null);
    break;
    
    
    }

}

function save_animation() {
    var filename = "motion_file"+ ".txt";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(theta));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function openFile(event) {

    var input = event.target;
     
    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      console.log(reader.result.substring(0, 200));
      array = (reader.result.substring(0, 200)).split(',');
      console.log("6",array[1]);
      
    };
    reader.readAsText(input.files[0]);
}

function interpoloter(){
    console.log("interpoloter"+counter);
    if(theta[i]>array[counter])
                theta[counter]--;
    else
        theta[counter]++;
}

function play_animation(){
    // theta = [0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 90, 90];
    //alert(theta);
    while(array[counter]!=theta[counter]){
        setTimeout(render, 3000);
    }
}



function traverse(Id) {
   
   if(Id == null) return; 
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child); 
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling); 
}



function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth*0.8, torsoHeight*1.4, torsoWidth*0.8));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
     for(var i =24; i<index; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
}

function tail() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, -2.0) );
    instanceMatrix = mult(instanceMatrix, scale4(tailwidth, tailheight*0.4, tailwidth*0.4) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =24; i<index; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
     
}

function head() {
   
    instanceMatrix = mult(modelViewMatrix, translate(0.0,  headHeight, 1.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth * 1.5, headHeight, headWidth*1.3 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =24; i<index; i++) gl.drawArrays(gl.TRIANGLES, i, 3);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix,scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]); 
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);    
     pointsArray.push(vertices[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}



window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    //document.getElementById('load_movement').addEventListener('change', load_animation, false);
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 1.0, 0.0, 1.0 );
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");
    
    gl.useProgram( program);

    instanceMatrix = mat4();
    
    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();

        
    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    
    cube();

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
        
    vBuffer = gl.createBuffer();
        
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
        document.getElementById("slider0").oninput = function() {
        theta[torsoId ] = event.srcElement.value;
        initNodes(torsoId);
    };
        document.getElementById("slider1").oninput = function() {
        theta[head1Id] = event.srcElement.value;
        initNodes(head1Id);
    };

    document.getElementById("slider2").oninput = function() {
         theta[leftUpperArmId] = event.srcElement.value;
         initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").oninput = function() {
         theta[leftLowerArmId] =  event.srcElement.value;
         initNodes(leftLowerArmId);
    };
     
        document.getElementById("slider4").oninput = function() {
        theta[rightUpperArmId] = event.srcElement.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").oninput = function() {
         theta[rightLowerArmId] =  event.srcElement.value;
         initNodes(rightLowerArmId);
    };
        document.getElementById("slider6").oninput = function() {
        theta[leftUpperLegId] = event.srcElement.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").oninput = function() {
         theta[leftLowerLegId] = event.srcElement.value;
         initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").oninput = function() {
         theta[rightUpperLegId] =  event.srcElement.value;
         initNodes(rightUpperLegId);
    };
        document.getElementById("slider9").oninput = function() {
        theta[rightLowerLegId] = Math.abs(event.srcElement.value);
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider11").oninput = function() {
         theta[tailid] = event.srcElement.value;
         
         initNodes(tailid);
    };

    for(i=0; i<numNodes; i++) initNodes(i);
    
    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        traverse(torsoId);
        requestAnimFrame(render);
}
