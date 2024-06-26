#version 300 es
precision highp float;

out vec4 OutColor;

uniform sampler2D Tex;

void main( void )
{
    // OutColor = vec4(1, 0, 0, 1);
    OutColor = texelFetch(Tex, ivec2(gl_FragCoord.xy), 0);
}