#version 300 es
precision highp float;
in vec3 InPosition;
in vec3 InNormal;
    
out vec3 DrawPos;
out vec3 DrawNormal;
uniform float Time;

uniform Prim
{
    mat4 MatWVP, MatW;
};

void main( void )
{
    DrawPos = vec3(MatW * vec4(InPosition, 1));
    gl_Position = MatWVP * vec4(InPosition, 1);
    DrawNormal = mat3(transpose(inverse(MatW))) * InNormal;
}