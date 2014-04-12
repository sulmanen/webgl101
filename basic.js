(function() {
'use strict';

    var vertexShaderSource =
            "    attribute vec3 vertexPos;\n" +
            "    uniform mat4 modelViewMatrix;\n" +
            "    uniform mat4 projectionMatrix;\n" +
            "    void main(void) {\n" +
            "        // Return the transformed and projected vertex value\n" +
            "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
            "            vec4(vertexPos, 1.0);\n" +
            "    }\n";

    var fragmentShaderSource =
            "    void main(void) {\n" +
            "    // Return the pixel color: always output white\n" +
            "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
            "}\n";

    var projectionMatrix,
        modelViewMatrix,
        canvas = document.getElementById('gl'),
        context = initWebGL(canvas);

    context.viewport(0, 0, canvas.width, canvas.heigth);
    initMatrices(canvas);
    initShader(context);
    draw(context, createSquare(context));

    function draw(gl, obj) {

        // clear the background (with black)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // set the vertex buffer to be drawn
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

        // set the shader to use
        gl.useProgram(shaderProgram);

        // connect up the shader parameters: vertex position
        // and projection/model matrices
        gl.vertexAttribPointer(shaderVertexPositionAttribute,
                               obj.vertSize, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);

        // draw the object
        gl.drawArrays(obj.primtype, 0, obj.nVerts);
    }

    function createShader(gl, str, type) {
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }
    var shaderProgram, shaderVertexPositionAttribute,
        shaderProjectionMatrixUniform,
        shaderModelViewMatrixUniform;

    function initShader(gl) {

        // load and compile the fragment and vertex shader
        var fragmentShader = createShader(gl, fragmentShaderSource,
                                          "fragment");
        var vertexShader = createShader(gl, vertexShaderSource,
                                        "vertex");

        // link them together into a new program
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // get pointers to the shader params
        shaderVertexPositionAttribute =
            gl.getAttribLocation(shaderProgram, "vertexPos");
        gl.enableVertexAttribArray(shaderVertexPositionAttribute);

        shaderProjectionMatrixUniform =
            gl.getUniformLocation(shaderProgram, "projectionMatrix");
        shaderModelViewMatrixUniform =
            gl.getUniformLocation(shaderProgram, "modelViewMatrix");


        if (!gl.getProgramParameter(shaderProgram,
                                    gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
    }
    function createSquare(gl) {
        var vertexBuffer;
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var verts = [
                .5,  .5,  0.0,
                -.5,  .5,  0.0,
                .5, -.5,  0.0,
                -.5, -.5,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        var square = {buffer:vertexBuffer, vertSize:3, nVerts:4,
                      primtype:gl.TRIANGLE_STRIP};
        return square;
    }

    function initMatrices(canvas)
    {
        // Create a model view matrix with camera at 0, 0, −3.333
        modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -3.333]);

        // Create a project matrix with 45 degree field of view
        projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI / 4,
                         canvas.width / canvas.height, 1, 10000);
    }

    function initWebGL(canvas) {
        var gl = null;
        var msg = "Your browser does not support WebGL, " +
                "or it is not enabled by default.";
        try
        {
            gl = canvas.getContext("experimental-webgl");
        }
        catch (e)
        {
            msg = "Error creating WebGL Context!: " + e.toString();
        }

        if (!gl)
        {
            alert(msg);
            throw new Error(msg);
        }

        return gl;
    }
}());
