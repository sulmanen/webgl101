(function(){
    'use strict';

    var horizAspect = 480.0/640.0;
    var canvas;
    var gl;
    var squareVerticesBuffer;
    var mvMatrix;
    var shaderProgram;
    var vertexPositionAttribute;
    var perspectiveMatrix;

    document.addEventListener('DOMContentLoaded', function() {
        start();
    });

    function start() {
        canvas = document.getElementById("gl");

        initWebGL(canvas);      // Initialize the GL context

        // Only continue if WebGL is available and working

        if (gl) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.clearDepth(1.0);                 // Clear everything
            gl.enable(gl.DEPTH_TEST);           // Enable depth testing
            gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

            // Initialize the shaders; this is where all the lighting for the
            // vertices and so forth is established.

            initShaders();

            // Here's where we call the routine that builds all the objects
            // we'll be drawing.

            initBuffers();

            // Set up to draw the scene periodically.

            setInterval(drawScene, 15);
        }
    }



    function initBuffers() {
        squareVerticesBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

        var vertices = [
            1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
                -1.0, -1.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }


    function getShader(gl, id) {
        var shaderScript, theSource, currentChild, shader;

        shaderScript = document.getElementById(id);

        if (!shaderScript) {
            return null;
        }

        theSource = '';

        currentChild = shaderScript.firstChild;

        while(currentChild){
            if (currentChild.nodeType === currentChild.TEXT_NODE) {
                theSource += currentChild.textContent;
            }
            currentChild = currentChild.nextSibling;
        }

        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            // Unknown shader type
            return null;
        }
        // attach shader to sourcecode
        gl.shaderSource(shader, theSource);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader =  getShader(gl, "shader-vs");

        // create shader program
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Shaders not compiling and linking.");
        }

        gl.useProgram(shaderProgram);

        vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(vertexPositionAttribute);
    }

    function initWebGL(canvas) {
        var msg = 'Your browser does not support WebGL, ' +
                'or it is not enabled by default.';
        try {
            gl = canvas.getContext('webgl');
        } catch (e) {
            msg = 'Error creating WebGL Context!: ' + e.toString();
        }

        if (!gl) {
            alert(msg);
            throw new Error(msg);
        }

        return gl;
    }

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

        // move square away from camera 6 units
        loadIdentity();
        mvTranslate([-0.0, 0.0, -6.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();

        // this draws the arrays
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function loadIdentity() {
        mvMatrix = Matrix.I(4);
    }

    function multMatrix(m) {
        mvMatrix = mvMatrix.x(m);
    }

    function mvTranslate(v) {
        multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    }

    function setMatrixUniforms() {
        var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
    }
}());
