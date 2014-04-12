(function(){
    'use strict';

    function getShader(gl, id) {
        var shaderScript, theSource, currentChild, shader;

        shaderScript = document.getElementById(id);

        if (!shaderScript) {
            return null;
        }

        theSource = '';

        currentChild = shaderScript.firstChildM

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

        vertextPostitionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertextAttribArray(vertexPositionAttribute);
    }

    function initWebGL(canvas) {
        var gl = null;
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
}());
