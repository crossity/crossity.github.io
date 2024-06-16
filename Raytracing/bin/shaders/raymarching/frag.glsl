#version 300 es
precision highp float;

in vec3 DrawNormal;
in vec3 DrawPos;
in vec2 DrawTexCoord;

out vec4 OutColor;

uniform Camera 
{
    vec4 LocProjDist, DirProjSize, Right4, Up4;
    vec4 Size4;
};

#define Loc LocProjDist.xyz
#define ProjDist LocProjDist.w
#define Dir DirProjSize.xyz
#define ProjSize DirProjSize.w
#define Right Right4.xyz
#define Up Up4.xyz
#define Size Size4.xy

uniform Material
{
    vec4 Ka4;      /* Ambient Time parameters */
    vec4 KdTrans;  /* Diffuse coefficient and transparency */
    vec4 KsPh;     /* Specular coefficient and Phong power value */
    vec4 TexFlags; /* Textures flags */
};

uniform sampler2D uSampler;
uniform float uSamplePart;

uniform float Time;

#define Ka Ka4.xyz
#define Kd KdTrans.xyz
#define Trans KdTrans.w
#define Ks KsPh.xyz
#define Ph KsPh.w

#define TYPE_BASIC 0
#define TYPE_LIGHT 1
#define TYPE_GLASS 2

float distance2(vec3 A, vec3 B)
{
    vec3 C = A - B;
    return dot( C, C );
}

float length2(vec3 A) {
    return dot(A, A);
}


float random(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
}

vec3 RandomOnSphere(vec3 dir) {
    vec3 rand;

    do {
        rand = vec3(random(vec2(dir.x, dir.y + dir.z)), random(vec2(dir.y + dir.x, dir.z * dir.z)), random(vec2(dir.x * dir.z, dir.z)));
    } while (length2(rand) > 1.0);

    return rand;
}

#define INF 100000.0
#define ZERO 0.001

struct OBJECT
{
    vec3 Pos, Color;
    float R, K;
    int Type;
};

struct INTERSECTION
{
    vec3 Pos;
    int ObjInd;
    float MinDist;
};

#define NumOfObjects 5
OBJECT Objects[NumOfObjects];

int RayCount = 0;

float SphereDistance(vec3 c, float r, vec3 pos) {
    return distance(c, pos) - r;
}

vec3 SphereNormal(vec3 c, float r, vec3 pos) {
    return (pos - c) / r;
}

INTERSECTION RayCast(vec3 pos, vec3 dir, float maxLen) {
    INTERSECTION intersection;
    intersection.MinDist = INF;

    vec3 start = pos;

    do {
        for (int i = 0; i < NumOfObjects; i++) 
        {
            float dist = SphereDistance(Objects[i].Pos, Objects[i].R, pos);

            if (dist < intersection.MinDist)
            {
                intersection.MinDist = dist;
                intersection.Pos = pos;
                intersection.ObjInd = i;
            }
        }

        pos = pos + dir * intersection.MinDist;       
    } while (intersection.MinDist > ZERO && distance2(pos, start) < maxLen * maxLen);

    return intersection;
}

vec3 RayTrace(vec3 pos, vec3 dir, float maxLen)
{
    vec3 color = vec3(1);
    for (int i = 0; i < 5; i++) 
    {
        INTERSECTION intersection = RayCast(pos + dir * 0.2, dir, maxLen);
        pos = intersection.Pos;
        vec3 n = SphereNormal(Objects[intersection.ObjInd].Pos, Objects[intersection.ObjInd].R, pos);
        
        if (intersection.MinDist <= ZERO) {
            vec3 col = Objects[intersection.ObjInd].Color;
            color *= col;

            int type = Objects[intersection.ObjInd].Type;

            if (type == TYPE_BASIC) {
                vec3 rand = RandomOnSphere(dir * vec3(float(RayCount) + mod(Time, 10000.0)) + gl_FragCoord.xyz);
                rand = reflect(dir, n) * (1.0 - Objects[intersection.ObjInd].K) + rand * Objects[intersection.ObjInd].K;

                dir = normalize(rand * dot(n, rand));
            }
            else if (type == TYPE_GLASS)
                dir = refract(dir, n, 1.0 / (1.0 - Objects[intersection.ObjInd].K));
            else if (type == TYPE_LIGHT)
                return color;
        }
        else
        {
            color *= vec3(0.6, 0.6, 1);

            return color;
        }
    }

    return vec3(0);
}

vec3 ToneMap(vec3 col)
{
    float white = 4.0;
    float exposure = 1.0;

	col *= white * exposure;
	col = (col * (1.0 + col / white / white)) / (1.0 + col);
    return col;
}

void main( void )
{
    float aspectRatio = Size.x / Size.y;
    vec2 ps = gl_FragCoord.xy / Size * 2.0 - vec2(aspectRatio, 1);
    float near = ProjDist * 2.0 / ProjSize, far = 10.0;
    vec3 dir = normalize(ps.x * Right + ps.y * Up + Dir * near);
    vec3 pos = dir + Loc;

    Objects[0].Pos = vec3(-0.8, -0.8, -10.0);
    Objects[0].R = 2.0;
    Objects[0].Color = vec3(0.5, 1, 0.4);
    Objects[0].Type = TYPE_BASIC;
    Objects[0].K = 0.1;

    Objects[1].Pos = vec3(0.5, 0.0, -6.0);
    Objects[1].R = 0.5;
    Objects[1].Color = vec3(1, 1, 1);
    Objects[1].Type = TYPE_LIGHT;
    Objects[1].K = 0.7;

    Objects[2].Pos = vec3(0.5 - 0.8, 3.0 - 0.8, -10.0);
    Objects[2].R = 1.0;
    Objects[2].Color = vec3(0.5, 1, 1);
    Objects[2].Type = TYPE_BASIC;
    Objects[2].K = 1.0;

    Objects[3].Pos = vec3(2.5, 1.3, -10.0);
    Objects[3].R = 1.5;
    Objects[3].Color = vec3(1, 0.5, 1);
    Objects[3].Type = TYPE_BASIC;
    Objects[3].K = 0.0;

    Objects[4].Pos = vec3(2.5, -2.0, -10.0);
    Objects[4].R = 1.3;
    Objects[4].Color = vec3(0.7, 0.2, 0.9);
    Objects[4].Type = TYPE_BASIC;
    Objects[4].K = 0.1;

    vec3 color = vec3(0);
    int MaxRayCount = 10;

    for (RayCount = 0; RayCount < MaxRayCount; RayCount++)
        color += RayTrace(pos, dir, far);
    color = color / float(MaxRayCount);
    vec3 prevColor = texelFetch(uSampler, ivec2(gl_FragCoord.xy), 0).xyz;
    color = ToneMap(color);
    color = mix(color, prevColor, 1.0 - uSamplePart);
    OutColor = vec4(color, 1);
}