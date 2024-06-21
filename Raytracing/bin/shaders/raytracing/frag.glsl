#version 300 es
precision highp float;

in vec3 DrawNormal;
in vec3 DrawPos;
in vec2 DrawTexCoord;

layout(location = 0) out vec4 OutColor;
layout(location = 1) out vec4 OutIndex;

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

uniform sampler2D Texture0;
uniform sampler2D Texture1;
uniform float uSamplePart;

uniform float Time;
uniform float DeltaTime;
uniform float Random;

uniform int EditObject;

#define Ka Ka4.xyz
#define Kd KdTrans.xyz
#define Trans KdTrans.w
#define Ks KsPh.xyz
#define Ph KsPh.w

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

#define LightM 0.000001
#define G (6.67408 * 1e-11)
#define LightV 0.1

#define TYPE_BASIC 0
#define TYPE_LIGHT 1
#define TYPE_GLASS 2

#define FigureSphere    0
#define FigureBox       1
#define FigurePlane     2

#define OpPut 0
#define OpSub 1

struct OBJECT
{
    vec3 Pos, Color;
    float R, K;
    int Type, Figure, Op;
};

struct INTERSECTION
{
    vec3 Pos, NewDir, N;
    int ObjInd;
    float MinDist, RefDist;
};

#define NumOfObjects 6
OBJECT Objects[NumOfObjects];

int RayCount = 0;

// Distance functions
float SphereDistance(vec3 c, float r, vec3 pos) 
{
    return distance(c, pos) - r;
}

float BoxDistance(vec3 c, float r, vec3 pos)
{
    vec3 d = abs(pos - c) - r;
    float box = min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
    return box;
}

float PlnaeDistance(vec3 n, float d, vec3 pos)
{
    return abs(dot(pos, n) - d);
}


// Figures manager
float DistanceHandler(int ObjectInd, vec3 pos)
{
    if (Objects[ObjectInd].Figure == FigureSphere)
        return SphereDistance(Objects[ObjectInd].Pos, Objects[ObjectInd].R, pos);
    else if (Objects[ObjectInd].Figure == FigureBox)
        return BoxDistance(Objects[ObjectInd].Pos, Objects[ObjectInd].R, pos);
    else if (Objects[ObjectInd].Figure == FigurePlane)
        return PlnaeDistance(Objects[ObjectInd].Pos, Objects[ObjectInd].R, pos);
}

INTERSECTION GetDistance(vec3 pos)
{
    INTERSECTION intersection;

    float MaxSubDist = -INF;
    intersection.MinDist = INF;

    for (int i = 0; i < NumOfObjects; i++) 
    {
        float dist = DistanceHandler(i, pos);

        if (Objects[i].Op == OpSub)
        {
            dist = -dist;
            if (dist > MaxSubDist)
                MaxSubDist = dist;
        }
        else
            if (dist < intersection.MinDist)
            {
                intersection.MinDist = dist;
                intersection.Pos = pos;
                intersection.ObjInd = i;
            }
    }

    if (intersection.MinDist < MaxSubDist)
        intersection.MinDist = MaxSubDist;
    return intersection;
}

vec3 GetNormal(vec3 pos) 
{
    vec2 e = vec2(0.0001, 0.0);

    vec3 n = vec3(
        GetDistance(pos + e.xyy).MinDist - GetDistance(pos - e.xyy).MinDist,
        GetDistance(pos + e.yxy).MinDist - GetDistance(pos - e.yxy).MinDist,
        GetDistance(pos + e.yyx).MinDist - GetDistance(pos - e.yyx).MinDist
    );

    return normalize(n);
}

INTERSECTION RayCast(vec3 pos, vec3 dir, float maxLen) 
{
    INTERSECTION intersection;
    intersection.MinDist = INF;

    vec3 start = pos;

    int MaxIts = 1000000, i = 0;
    float RefDist = 0.0;

    while (distance2(pos, start) < maxLen * maxLen && i < MaxIts)
    {
        RefDist = intersection.MinDist;
        intersection = GetDistance(pos);

        if (intersection.MinDist <= ZERO)
            break;
        pos = pos + dir * intersection.MinDist;

        i++;
    };

    if (intersection.MinDist <= ZERO)
    {
        intersection.Pos = intersection.Pos + dir * (intersection.MinDist - ZERO * 0.0);
        intersection.MinDist = 0.0;
    }
    intersection.NewDir = dir;
    intersection.N = GetNormal(intersection.Pos);
    // intersection.N = faceforward(intersection.N, pos - start, intersection.N);
    intersection.RefDist = RefDist;
    intersection.N = normalize(intersection.N);
    return intersection;
}

#define OUTLINE_SIZE 0.05

vec3 RayTrace(vec3 pos, vec3 dir, float maxLen)
{
    vec3 color = vec3(1), n = vec3(0);
    float PrevDist = 0.0;
    
    for (int i = 0; i < 100; i++) 
    {
        INTERSECTION intersection = RayCast(pos + n * ZERO * 2.0, dir, maxLen);

        pos = intersection.Pos;
        dir = intersection.NewDir;
        n = intersection.N;

        PrevDist = intersection.RefDist;

        // return (n + vec3(1.0)) * 0.5; 

        // return intersection.MinDist * vec3(1);

        // return vec3(EditObject) / 6.0;

        if (intersection.MinDist <= ZERO) {
            if (i == 0)
                OutIndex = vec4(intersection.ObjInd) / 255.0;
            
            if (i == 0 && intersection.ObjInd == EditObject && (mod(pos.x, 0.2) - OUTLINE_SIZE < 0.0 || mod(pos.y, 0.2) - OUTLINE_SIZE < 0.0 || mod(pos.z, 0.2) - OUTLINE_SIZE < 0.0))
            {
                return vec3(0.1, 0.5, 0.9);
            }

            vec3 col = Objects[intersection.ObjInd].Color;
            color *= col;

            int type = Objects[intersection.ObjInd].Type;

            if (type == TYPE_BASIC) {
                vec3 rand = RandomOnSphere(dir * vec3(float(RayCount) + Random + mod(Time, 1000.0) / 1000.0) + gl_FragCoord.xyz);
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
            OutIndex = vec4(1);
            return 0.0 * color;
        }
    }
    OutIndex = vec4(1);
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

#define FLOATS_IN_OBJECT 11

void LoadScene()
{
    for (int i = 0; i < NumOfObjects; i++)
    {
        int j = i * FLOATS_IN_OBJECT;

        Objects[i].Pos.x = texelFetch(Texture1, ivec2(j + 0, 0), 0).r;
        Objects[i].Pos.y = texelFetch(Texture1, ivec2(j + 1, 0), 0).r;
        Objects[i].Pos.z = texelFetch(Texture1, ivec2(j + 2, 0), 0).r;
        Objects[i].Color.x = texelFetch(Texture1, ivec2(j + 3, 0), 0).r;
        Objects[i].Color.y = texelFetch(Texture1, ivec2(j + 4, 0), 0).r;
        Objects[i].Color.z = texelFetch(Texture1, ivec2(j + 5, 0), 0).r;
        Objects[i].R = texelFetch(Texture1, ivec2(j + 6, 0), 0).r;
        Objects[i].K = texelFetch(Texture1, ivec2(j + 7, 0), 0).r;
        Objects[i].Type = int(texelFetch(Texture1, ivec2(j + 8, 0), 0).r);
        Objects[i].Figure = int(texelFetch(Texture1, ivec2(j + 9, 0), 0).r);
        Objects[i].Op = int(texelFetch(Texture1, ivec2(j + 10, 0), 0).r);
    }
}

void main( void )
{
    float aspectRatio = Size.x / Size.y;
    vec2 ps = gl_FragCoord.xy / Size * 2.0 - vec2(aspectRatio, 1);
    float near = ProjDist * 2.0 / ProjSize, far = 100.0;
    vec3 dir = normalize(ps.x * Right + ps.y * Up + Dir * near);
    vec3 pos = dir + Loc;

    // Objects[0].Pos = vec3(0.5 - 0.8, 3.0 - 2.0, -10.0);
    // Objects[0].R = 1.0;
    // Objects[0].Color = vec3(0.9, 0.9, 0.9);
    // Objects[0].Type = TYPE_BASIC;
    // Objects[0].K = 1.0;
    // Objects[0].Figure = FigureSphere;
    // Objects[0].Op = OpSub;

    // Objects[1].Pos = vec3(-0.8, -0.8, -10.0);
    // Objects[1].R = 2.0;
    // Objects[1].Color = vec3(0.9, 0.9, 0.9);
    // Objects[1].Type = TYPE_BASIC;
    // Objects[1].K = 1.0;
    // Objects[1].Figure = FigureSphere;
    // Objects[1].Op = OpPut;

    // // R = 0.5 pos = 0.5, 0.0, -6.0
    // Objects[2].Pos = normalize(vec3(1));
    // Objects[2].R = 10.0;
    // Objects[2].Color = vec3(1, 1, 1);
    // Objects[2].Type = TYPE_LIGHT;
    // Objects[2].K = 0.7;
    // Objects[2].Figure = FigurePlane;
    // Objects[2].Op = OpPut;

    // Objects[3].Pos = vec3(2.5, 1.3, -10.0);
    // Objects[3].R = 1.5;
    // Objects[3].Color = vec3(1, 0.5, 1);
    // Objects[3].Type = TYPE_BASIC;
    // Objects[3].K = 0.03;
    // Objects[3].Figure = FigureSphere;
    // Objects[3].Op = OpPut;

    // Objects[4].Pos = vec3(2.5, -2.0, -10.0);
    // Objects[4].R = 1.3;
    // Objects[4].Color = vec3(0.7, 0.2, 0.9);
    // Objects[4].Type = TYPE_BASIC;
    // Objects[4].K = 0.1;
    // Objects[4].Figure = FigureSphere;
    // Objects[4].Op = OpPut;

    // Objects[5].Pos = vec3(0, -12, -5);
    // Objects[5].R = 10.0;
    // Objects[5].Color = vec3(0.9, 0.9, 0.9);
    // Objects[5].Type = TYPE_BASIC;
    // Objects[5].K = 1.0;
    // Objects[5].Figure = FigureBox;
    // Objects[5].Op = OpPut;

    LoadScene();

    vec3 color = vec3(0);
    int MaxRayCount = 4;

    for (RayCount = 0; RayCount < MaxRayCount; RayCount++)
        color += RayTrace(pos, dir, far);
    color = color / float(MaxRayCount);
    vec3 prevColor = texelFetch(Texture0, ivec2(gl_FragCoord.xy), 0).xyz;
    color = ToneMap(color);
    color = mix(color, prevColor, 1.0 - uSamplePart);
    OutColor = vec4(color, 1);
}