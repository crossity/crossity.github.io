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
uniform sampler2D Texture2;
uniform float uSamplePart;

uniform float Time;
uniform float DeltaTime;
uniform float Random;

uniform int EditObject;
uniform int MaxRayCount;
uniform int NumOfReflections;

uniform int Mode;

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

#define TYPE_BASIC 0
#define TYPE_LIGHT 1
#define TYPE_GLASS 2

#define FIGURE_SPHERE    0
#define FIGURE_BOX       1
#define FIGURE_PLANE     2
#define FIGURE_MANDEL    3

#define OP_PUT 0
#define OP_SUB 1
#define OP_UNI 2

struct INTERSECTION
{
    vec3 Pos, NewDir, N, Color;
    int ObjInd;
    float MinDist, K;
};

int NumOfObjects = 0;

#define FLOATS_IN_OBJECT 11

// Reading objects info from float texture functions.
void LoadNumOfObjects()
{
    NumOfObjects = int(texelFetch(Texture1, ivec2(0), 0).r);
}

vec3 GetPos(int i) 
{
    int j = i * FLOATS_IN_OBJECT + 1;

    vec3 pos;

    pos.x = texelFetch(Texture1, ivec2(j + 0, 0), 0).r;
    pos.y = texelFetch(Texture1, ivec2(j + 1, 0), 0).r;
    pos.z = texelFetch(Texture1, ivec2(j + 2, 0), 0).r;

    return pos;
}

vec3 GetColor(int i) 
{
    int j = i * FLOATS_IN_OBJECT + 1;

    vec3 color;

    color.x = texelFetch(Texture1, ivec2(j + 3, 0), 0).r;
    color.y = texelFetch(Texture1, ivec2(j + 4, 0), 0).r;
    color.z = texelFetch(Texture1, ivec2(j + 5, 0), 0).r;

    return color;
}

float GetR(int i)
{
    int j = i * FLOATS_IN_OBJECT + 1;
    
    return texelFetch(Texture1, ivec2(j + 6, 0), 0).r;
}

float GetK(int i)
{
    int j = i * FLOATS_IN_OBJECT + 1;
    
    return texelFetch(Texture1, ivec2(j + 7, 0), 0).r;
}

int GetType(int i)
{
    int j = i * FLOATS_IN_OBJECT + 1;

    return int(texelFetch(Texture1, ivec2(j + 8, 0), 0).r);
}

int GetFigure(int i)
{
    int j = i * FLOATS_IN_OBJECT + 1;

    return int(texelFetch(Texture1, ivec2(j + 9, 0), 0).r);
}

int GetOp(int i)
{
    int j = i * FLOATS_IN_OBJECT + 1;

    return int(texelFetch(Texture1, ivec2(j + 10, 0), 0).r);
}

int RayCount = 0;

// Distance functions
float SphereDistance(vec3 c, float r, vec3 pos) 
{
    return distance(c, pos) - r;
}

float MandelDistance(vec3 c, float r, vec3 pos)
{
    vec3 z0 = (pos - c) / r;
    vec3 z = z0;
	float dr = 1.0;
	r = 0.0;
    float Power = 8.0;
	for (int i = 0; i < 10 ; i++) {
		r = length(z);
		if (r > 2.0) break;
		
		// convert to polar coordinates
		float theta = acos(z.z/r);
		float phi = atan(z.y,z.x);
		dr =  pow( r, Power-1.0)*Power*dr + 1.0;
		
		// scale and rotate the point
		float zr = pow( r,Power);
		theta = theta*Power;
		phi = phi*Power;
		
		// convert back to cartesian coordinates
		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
		z+= z0;
	}
	return 0.5*log(r)*r/dr;
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
    int fig = GetFigure(ObjectInd);
    float r = GetR(ObjectInd);
    vec3 c = GetPos(ObjectInd);

    if (fig == FIGURE_SPHERE)
        return SphereDistance(c, r, pos);
    else if (fig == FIGURE_BOX)
        return BoxDistance(c, r, pos);
    else if (fig == FIGURE_PLANE)
        return PlnaeDistance(c, r, pos);
    else if (fig == FIGURE_MANDEL)
        return MandelDistance(c, r, pos);
}

INTERSECTION SmoothUnion(INTERSECTION d1, INTERSECTION d2, float k)
{
    INTERSECTION i;
    float h = clamp(0.5 + 0.5 * (d2.MinDist - d1.MinDist) / k, 0.0, 1.0);

    i.MinDist = mix( d2.MinDist, d1.MinDist, h ) - k * h * (1.0 - h);
    i.Color = mix(d2.Color, d1.Color, h);
    i.K = mix(d2.K, d1.K, h);
    
    i.ObjInd = h < 0.5 ? d2.ObjInd : d1.ObjInd;
    // i.Color = vec3(h);
    return i; 
}

INTERSECTION GetDistance(vec3 pos)
{
    INTERSECTION intersection;

    float MaxSubDist = -INF;
    INTERSECTION Uni;

    Uni.MinDist = INF;
    intersection.MinDist = INF;

    intersection.ObjInd = -1;

    for (int i = 0; i < NumOfObjects; i++) 
    {
        float dist = DistanceHandler(i, pos);
        int op = GetOp(i);

        if (op == OP_SUB && !bool(Mode))
        {
            dist = -dist;
            if (dist > MaxSubDist)
                MaxSubDist = dist;
        }
        else if (op == OP_UNI && !bool(Mode))
        {
            if (Uni.MinDist == INF)
            {
                Uni.MinDist = dist;
                Uni.Color = GetColor(i);
                Uni.K = GetK(i);
                Uni.ObjInd = i;
            }
            else
            {
                INTERSECTION inter;

                inter.MinDist = dist;
                inter.Color = GetColor(i);
                inter.K = GetK(i);
                inter.ObjInd = i;
                Uni = SmoothUnion(Uni, inter, 0.5);
            }
            if (Uni.MinDist < intersection.MinDist)
            {
                intersection.MinDist = Uni.MinDist;
                intersection.Color = Uni.Color;
                intersection.ObjInd = Uni.ObjInd;
                intersection.K = Uni.K;
            }
        }
        else
            if (dist < intersection.MinDist)
            {
                intersection.MinDist = dist;
                intersection.ObjInd = i;
                intersection.Color = GetColor(i);
                intersection.K = GetK(i);
            }
    }

    intersection.Pos = pos;
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

    while (distance2(pos, start) < maxLen * maxLen && i < MaxIts)
    {
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
    intersection.N = normalize(intersection.N);
    return intersection;
}

#define OUTLINE_SIZE 0.05

vec3 RayTrace(vec3 pos, vec3 dir, float maxLen)
{
    vec3 color = vec3(1), n = vec3(0);

    if (bool(Mode)) 
    {
        INTERSECTION intersection = RayCast(pos, dir, maxLen);
        vec3 LightDir = normalize(vec3(1));
        pos = intersection.Pos;

        if (intersection.MinDist <= ZERO) {
            OutIndex = vec4(intersection.ObjInd) / 255.0;
            float d = max(dot(intersection.N, LightDir), 0.1);
            color = intersection.Color;

            if (intersection.ObjInd == EditObject && (mod(pos.x, 0.2) - OUTLINE_SIZE < 0.0 || mod(pos.y, 0.2) - OUTLINE_SIZE < 0.0 || mod(pos.z, 0.2) - OUTLINE_SIZE < 0.0))
                return vec3(0.1, 0.5, 0.9);
            if (GetOp(intersection.ObjInd) == OP_SUB)
                return vec3(1, 0, 0);
            return color * d;
        }
        OutIndex = vec4(1);
        return vec3(0, 0, 0);
    }
    
    for (int i = 0; i < NumOfReflections; i++) 
    {
        INTERSECTION intersection = RayCast(pos + n * ZERO * 2.0, dir, maxLen);

        pos = intersection.Pos;
        dir = intersection.NewDir;
        n = intersection.N;

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

            vec3 col = intersection.Color;
            color *= col;

            int type = GetType(intersection.ObjInd);
            float k = intersection.K;

            if (type == TYPE_BASIC) {
                vec3 rand = RandomOnSphere(dir * vec3(float(RayCount) + Random + mod(Time, 1000.0) / 1000.0) + gl_FragCoord.xyz);
                rand = reflect(dir, n) * (1.0 - k) + rand * k;

                dir = normalize(rand * dot(n, rand));
            }
            else if (type == TYPE_GLASS)
                dir = refract(dir, n, 1.0 / (1.0 - k));
            else if (type == TYPE_LIGHT)
                return color * k * 10.0;
        }
        else
        {
            color *= vec3(0.6, 0.6, 1);
            if (i != 0)
                OutIndex = vec4(1);
            return 0.0 * color;
        }
    }
    OutIndex = vec4(1);
    return vec3(0);
}

vec3 ToneMap(vec3 col)
{
    float white = 2.0;
    float exposure = 0.9;

	col *= white * exposure;
	col = (col * (1.0 + col / white / white)) / (1.0 + col);
    col = pow(col, vec3(0.4545));
    return col;
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
    // Objects[0].Figure = FIGURE_SPHERE;
    // Objects[0].Op = OP_SUB;

    // Objects[1].Pos = vec3(-0.8, -0.8, -10.0);
    // Objects[1].R = 2.0;
    // Objects[1].Color = vec3(0.9, 0.9, 0.9);
    // Objects[1].Type = TYPE_BASIC;
    // Objects[1].K = 1.0;
    // Objects[1].Figure = FIGURE_SPHERE;
    // Objects[1].Op = OP_PUT;

    // // R = 0.5 pos = 0.5, 0.0, -6.0
    // Objects[2].Pos = normalize(vec3(1));
    // Objects[2].R = 10.0;
    // Objects[2].Color = vec3(1, 1, 1);
    // Objects[2].Type = TYPE_LIGHT;
    // Objects[2].K = 0.7;
    // Objects[2].Figure = FIGURE_PLANE;
    // Objects[2].Op = OP_PUT;

    // Objects[3].Pos = vec3(2.5, 1.3, -10.0);
    // Objects[3].R = 1.5;
    // Objects[3].Color = vec3(1, 0.5, 1);
    // Objects[3].Type = TYPE_BASIC;
    // Objects[3].K = 0.03;
    // Objects[3].Figure = FIGURE_SPHERE;
    // Objects[3].Op = OP_PUT;

    // Objects[4].Pos = vec3(2.5, -2.0, -10.0);
    // Objects[4].R = 1.3;
    // Objects[4].Color = vec3(0.7, 0.2, 0.9);
    // Objects[4].Type = TYPE_BASIC;
    // Objects[4].K = 0.1;
    // Objects[4].Figure = FIGURE_SPHERE;
    // Objects[4].Op = OP_PUT;

    // Objects[5].Pos = vec3(0, -12, -5);
    // Objects[5].R = 10.0;
    // Objects[5].Color = vec3(0.9, 0.9, 0.9);
    // Objects[5].Type = TYPE_BASIC;
    // Objects[5].K = 1.0;
    // Objects[5].Figure = FIGURE_BOX;
    // Objects[5].Op = OP_PUT;

    vec3 prevColor = texelFetch(Texture0, ivec2(gl_FragCoord.xy), 0).xyz;

    if (uSamplePart < 2.0 / 255.0 && !bool(Mode))
    {
        // OutColor = vec4(texelFetch(Texture2, ivec2(gl_FragCoord.xy), 0).xyz, 1);
        OutColor = vec4(prevColor, 1);
        OutIndex = texelFetch(Texture2, ivec2(gl_FragCoord.xy), 0).xyzw;
        return;
    }

    LoadNumOfObjects();

    vec3 color = vec3(0);
    int RaysCount = bool(Mode) ? 1 : MaxRayCount;

    for (RayCount = 0; RayCount < RaysCount; RayCount++)
        color += RayTrace(pos, dir, far);
    color = color / float(RaysCount);
    color = ToneMap(color);
    color = mix(color, prevColor, 1.0 - uSamplePart);
    OutColor = vec4(color, 1);

    // OutColor = vec4(vec3(float(MaxRayCount) / 100.0), 1);
}