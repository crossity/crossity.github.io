#version 300 es
precision highp float;
in vec3 InPosition;
in vec3 InNormal;
in vec2 InTexCoord;
    
out vec3 DrawPos;
out vec3 DrawNormal;
out vec2 DrawTexCoord;

uniform Prim
{
    mat4 MatWVP, MatW;
};

void main( void )
{
    DrawPos = vec3(MatW * vec4(InPosition, 1));
    gl_Position = vec4(InPosition, 1);
    DrawNormal = mat3(transpose(inverse(MatW))) * InNormal;
    DrawTexCoord = InTexCoord;
}