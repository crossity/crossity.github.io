#version 300 es
precision highp float;

in vec3 DrawNormal;
in vec3 DrawPos;
in vec2 DrawTexCoord;

out vec4 OutColor;

uniform Camera 
{
    vec4 Loc, Dir;
};

uniform Material
{
    vec4 Ka4;      /* Ambient Time parameters */
    vec4 KdTrans;  /* Diffuse coefficient and transparency */
    vec4 KsPh;     /* Specular coefficient and Phong power value */
    vec4 TexFlags; /* Textures flags */
};

uniform sampler2D uSampler;

#define Ka Ka4.xyz
#define Kd KdTrans.xyz
#define Trans KdTrans.w
#define Ks KsPh.xyz
#define Ph KsPh.w

void main( void )
{
    vec3 N = normalize(DrawNormal), L = normalize(vec3(-1, 1, 1));
    N = faceforward(N, normalize(DrawPos - Loc.xyz), N);


    vec3 t = Kd;
    if (bool(TexFlags[0])) 
        t = texture(uSampler, DrawTexCoord).rgb;

    // t = DrawTexCoord.xyx;

    float d = max(0.1, dot(N, L));

    vec3 R = reflect(Dir.xyz, N);
    vec3 color = Ka + t * d + Ks * max(0.1, pow(dot(R, L), Ph));

    OutColor = vec4(color, 1.0);
}