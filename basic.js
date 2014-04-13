(function(){
    'use strict';

    var horizAspect = 480.0/640.0,
        squareRotation = 0.0,
        canvas,
        gl,
        squareVerticesBuffer,
        squareVerticesColorBuffer,
        mvMatrix,
        perspectiveMatrix,
        shaderProgram,
        vertexPositionAttribute,
        vertexColorAttribute,
        lastSquareUpdateTime,
        squareXOffset = 0.0,
        squareYOffset = 0.0,
        squareZOffset = 0.0,
        xIncValue = 0.2,
        yIncValue = -0.4,
        zIncValue = 0.3;

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

        var colors = [
            1.0,  1.0,  1.0,  1.0,    // white
            1.0,  0.0,  0.0,  1.0,    // red
            0.0,  1.0,  0.0,  1.0,    // green
            0.0,  0.0,  1.0,  1.0     // blue
        ];

        squareVerticesColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
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

        vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(vertexColorAttribute);
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
        var currentTime = (new Date).getTime();

        // clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        perspectiveMatrix = makePerspective(45.0, 1, 0.1, 100.0);

        // move square away from camera 6 units
        loadIdentity();
        mvTranslate([0.0, 0.0, -20.0]);

        // rotation
        if (lastSquareUpdateTime) {
            var delta = currentTime -lastSquareUpdateTime;
            squareRotation += (30 * delta) / 1000.0;
            squareXOffset += xIncValue * ((30 * delta) / 1000.0);
            squareYOffset += yIncValue * ((30 * delta) / 1000.0);
            squareZOffset += zIncValue * ((30 * delta) / 1000.0);

            if (Math.abs(squareYOffset) > 2.5) {
                xIncValue = -xIncValue;
                yIncValue = -yIncValue;
                zIncValue = -zIncValue;
            }
        }

        lastSquareUpdateTime = currentTime;

        mvPushMatrix();
        mvRotate(squareRotation, [1, 0, 1]);


        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();

        // this draws the arrays
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // restore original rotation
        mvPopMatrix();
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

    var mvMatrixStack = [];

    function mvPushMatrix(m) {
        if (m) {
            mvMatrixStack.push(m.dup());
            mvMatrix = m.dup();
        } else {
            mvMatrixStack.push(mvMatrix.dup());
        }
    }

    function mvPopMatrix() {
        if (!mvMatrixStack.length) {
            throw("Can't pop from an empty matrix stack.");
        }

        mvMatrix = mvMatrixStack.pop();
        return mvMatrix;
    }

    function mvRotate(angle, v) {
        var inRadians = angle * Math.PI / 180.0;

        var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
        multMatrix(m);
    }
}());
