#version 420 core
out vec4 IrradianceHeightOut; // ([W/m^2], [m])
out vec3 NormalOut;

in vec2 texCoords;
in vec4 w_rayDir;

uniform int mirrorSampleResolution;
uniform vec2 mirrorSampleAreaScale;
uniform float wMirrorDistance;
uniform float mirrorShininess;
uniform float wMirrorDepth;
uniform float mirrorCurvatureRadius;
uniform vec2 wMirrorSize;
uniform vec2 wCanvasSize;
uniform vec4 wLightPos;
uniform float lightPowerDensity;
uniform float mirrorConvexity;
uniform float wShapeOutlineWidth;
uniform float carvRadius;
uniform float carvConvexity;
uniform int lineMode;   // 0 ... step, 1 ... carving
uniform float _sx0;
uniform float _sx1;
uniform float _sx2;
uniform float _sx3;
uniform float _sy0;
uniform float _sy1;
uniform float _sy2;
uniform float _sy3;

float m_pi = 3.141592653589793;

/*
    Returns height and derivative of height
*/
vec2 curvature(float u, float s0, float s1, float r, float convexity) {
    return convexity * vec2(
        sqrt(pow(r, 2) - pow(u - (s0 + s1) / 2.0, 2)) - sqrt(pow(r, 2) - pow((s1 - s0) / 2.0, 2)),

        ((s0 + s1) / 2.0 - u) 
        / sqrt(pow(r, 2) - pow(u - (s0 + s1) / 2.0, 2))
    );
}

/*
    Returns height and derivative of height
*/
vec2 smoothStep(float u, float s0, float s1, float h0, float dir) {
    float c = 3; 
    return vec2(
        h0 * (1 - dir) * 0.5 + dir * h0 * 0.5 * (tanh(
                                c * (
                                    2 * (u - s0) / (s1 - s0) - 1.0
                                )
                            ) / tanh(c) + 1.0
                  ),
        dir * h0 * c / (tanh(c) * (s1 - s0)) * (
                    1.0 - pow(
                        tanh(
                            c * (
                                2 * (u - s0) / (s1 - s0) - 1
                            )
                        ), 2
                    )
                )
    );
}

vec3 topSquare(vec2 uv) {
    float addH = 0;
    float dU = 0;
    float dV = 0;
    vec2 uvLineWidth = wShapeOutlineWidth.xx / wMirrorSize;

    if (uv.x <= _sx1 + uvLineWidth.x) {
         vec2 res;
         if (0 == lineMode) {
            res = smoothStep(uv.x, _sx1, _sx1 + uvLineWidth.x, wMirrorDepth, 1);
         }
         else if (1 == lineMode) {
            res = curvature(uv.x, _sx1, _sx1 + uvLineWidth.x, carvRadius, carvConvexity);
         }
         addH = res.x;
         dU = res.y;
    }
    else if (uv.x >= _sx2 - uvLineWidth.x) {
         vec2 res;
         if (0 == lineMode) {
            res = smoothStep(uv.x, _sx2 - uvLineWidth.x, _sx2, wMirrorDepth, -1);
         }
         else if (1 == lineMode) {
            res = curvature(uv.x, _sx2 - uvLineWidth.x, _sx2, carvRadius, carvConvexity);
         }
         addH = res.x;
         dU = res.y;
    }
    else if (uv.y <= _sy0 + uvLineWidth.y) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.y, _sy0, _sy0 + uvLineWidth.y, wMirrorDepth, 1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.y, _sy0, _sy0 + uvLineWidth.y, carvRadius, carvConvexity);
         }
         addH = res.x;
         dV = res.y;
    }
    else if (0 == lineMode) {
        addH = wMirrorDepth;
    }
    return vec3(addH, dU, dV);
}

vec3 bottomSquare(vec2 uv) {
    float addH = 0;
    float dU = 0;
    float dV = 0;
    vec2 uvLineWidth = wShapeOutlineWidth.xx / wMirrorSize;

    if (uv.x <= _sx1 + uvLineWidth.x) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.x, _sx1, _sx1 + uvLineWidth.x, wMirrorDepth, 1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.x, _sx1, _sx1 + uvLineWidth.x, carvRadius, carvConvexity);
         }
         addH = res.x;
         dU = res.y;
    }
    else if (uv.x >= _sx2 - uvLineWidth.x) {
         vec2 res;
         if (0 == lineMode) {
            res = smoothStep(uv.x, _sx2 - uvLineWidth.x, _sx2, wMirrorDepth, -1);
         }
         else if (1 == lineMode) {
            res = curvature(uv.x, _sx2 - uvLineWidth.x, _sx2, carvRadius, carvConvexity);
         };
         addH = res.x;
         dU = res.y;
    }
    else if (uv.y >= _sy3 - uvLineWidth.y) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.y, _sy3 - uvLineWidth.y, _sy3, wMirrorDepth, -1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.y, _sy3 - uvLineWidth.y, _sy3, carvRadius, carvConvexity);
         }
         addH = res.x;
         dV = res.y;
    }
    else if (0 == lineMode) {
        addH = wMirrorDepth;
    }
    return vec3(addH, dU, dV);
}

vec3 leftSquare(vec2 uv) {
    float addH = 0;
    float dU = 0;
    float dV = 0;
    vec2 uvLineWidth = wShapeOutlineWidth.xx / wMirrorSize;

    if (uv.y <= _sy1 + uvLineWidth.y) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.y, _sy1, _sy1 + uvLineWidth.y, wMirrorDepth, 1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.y, _sy1, _sy1 + uvLineWidth.y, carvRadius, carvConvexity);
         }
         addH = res.x;
         dV = res.y;
    }
    else if (uv.y >= _sy2 - uvLineWidth.y) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.y, _sy2 - uvLineWidth.y, _sy2, wMirrorDepth, -1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.y, _sy2 - uvLineWidth.y, _sy2, carvRadius, carvConvexity);
         }
         addH = res.x;
         dV = res.y;
    }
    else if (uv.x <= _sx0 + uvLineWidth.x) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.x, _sx0, _sx0 + uvLineWidth.x, wMirrorDepth, 1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.x, _sx0, _sx0 + uvLineWidth.x, carvRadius, carvConvexity);
         }
         addH = res.x;
         dU = res.y;
    }
    else if (0 == lineMode) {
        addH = wMirrorDepth;
    }
    return vec3(addH, dU, dV);
}
vec3 rightSquare(vec2 uv) {
    float addH = 0;
    float dU = 0;
    float dV = 0;
    vec2 uvLineWidth = wShapeOutlineWidth.xx / wMirrorSize;

    if (uv.y <= _sy1 + uvLineWidth.y) {
         vec2 res;
         if (0 == lineMode) {
            res = smoothStep(uv.y, _sy1, _sy1 + uvLineWidth.y, wMirrorDepth, 1);
         }
         else if (1 == lineMode) {
            res = curvature(uv.y, _sy1, _sy1 + uvLineWidth.y, carvRadius, carvConvexity);
         }
         addH = res.x;
         dV = res.y;
    }
    else if (uv.y >= _sy2 - uvLineWidth.y) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.y, _sy2 - uvLineWidth.y, _sy2, wMirrorDepth, -1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.y, _sy2 - uvLineWidth.y, _sy2, carvRadius, carvConvexity);
         }
         addH = res.x;
         dV = res.y;
    }
    else if (uv.x >= _sx3 - uvLineWidth.x) {
         vec2 res;
         if (0 == lineMode) {
             res = smoothStep(uv.x, _sx3 - uvLineWidth.x, _sx3, wMirrorDepth, -1);
         }
         else if (1 == lineMode) {
             res = curvature(uv.x, _sx3 - uvLineWidth.x, _sx3, carvRadius, carvConvexity);
         }
         addH = res.x;
         dU = res.y;
    }
    else if (0 == lineMode) {
        addH = wMirrorDepth;
    }
    return vec3(addH, dU, dV);
}

/*
    Calculates the normal and the height of the mirror at a given UV coordinate.
*/
vec4 normHeight(vec2 uv) {

    float wHeight = 0;
    float wDU = 0;
    float wDV = 0;

    // Overall curvature
    vec2 overallCurv = curvature(uv.x, 0, 1, mirrorCurvatureRadius, mirrorConvexity);  // Overall curvature
    wHeight += overallCurv.x;
    wDU += overallCurv.y;
    
    // Cross shape
    if (uv.x >= _sx0 && uv.x <= _sx3) { // horizontally in shape
        if (uv.y >= _sy0 && uv.y <= _sy3) { // vertically in shape
            if (uv.x >= _sx1 && uv.x <= _sx2) { // middle column
                if (uv.y < _sy1) {  // Top square
                    vec3 retVal = topSquare(uv);
                    wHeight += retVal.x;
                    wDU += retVal.y;
                    wDV += retVal.z;
                }
                else if (uv.y > _sy2) { // Bottom square
                    vec3 retVal = bottomSquare(uv);
                    wHeight += retVal.x;
                    wDU += retVal.y;
                    wDV += retVal.z;   
                }
                else if (0 == lineMode) { // Middle square
                    wHeight += wMirrorDepth;
                }
            }
            else if (uv.x < _sx1) { // left column
                if (uv.y >= _sy1 && uv.y <= _sy2) { // left square
                    vec3 retVal = leftSquare(uv);
                    wHeight += retVal.x;
                    wDU += retVal.y;
                    wDV += retVal.z;   
                }
            }
            else if (uv.x > _sx2) { // right column
                if (uv.y >= _sy1 && uv.y <= _sy2) { // right square
                    vec3 retVal = rightSquare(uv);
                    wHeight += retVal.x;
                    wDU += retVal.y;
                    wDV += retVal.z;
                }
            }
        }
    }

    // Tangent vectors:
    /*
    wMirrorSize is needed because earlier we parametrized
    the surface function with uv coordiantes of range [0,1]
    */
    vec3 tanU = vec3(wMirrorSize.x, 0, wDU);
    vec3 tanV = vec3(0, wMirrorSize.y, wDV);

    return vec4(normalize(cross(tanU, tanV)), wHeight);
}

float mirrorBRDF(vec3 inDir, vec3 outDir, vec3 normal) {
    float c_n = (mirrorShininess + 2.0) / 2.0 / m_pi;
    float dotNL = dot(normal, inDir);
    float dotNV = dot(normal, outDir);
    return c_n * pow(max(2.0 * dotNL * dotNV - dot(inDir, outDir), 0.0), mirrorShininess)
        / max(dotNL, dotNV);
}

/* Function to linearly interpolate between a0 and a1
 * Weight w should be in the range [0.0, 1.0]
 */
float interpolate(float a0, float a1, float w) {
    /* // You may want clamping by inserting:
     * if (0.0 > w) return a0;
     * if (1.0 < w) return a1;
     */
    return (a1 - a0) * w + a0;
    /* // Use this cubic interpolation [[Smoothstep]] instead, for a smooth appearance:
     * return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
     *
     * // Use [[Smootherstep]] for an even smoother result with a second derivative equal to zero on boundaries:
     * return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
     */
}


// ------------------------- RANDOM GENERATION ----------------------------------------------

/* Create pseudorandom direction vector
 */
vec2 randomGradient(int ix, int iy) {
    // No precomputed gradients mean this works for any number of grid coordinates
    uint w = 8 * 32;
    uint s = w / 2; // rotation width
    uint a = ix, b = iy;
    a *= 3284157443; b ^= a << s | a >> w-s;
    b *= 1911520717; a ^= b << s | b >> w-s;
    a *= 2048419325;
    float random = a * (3.14159265 / ~(~0u >> 1)); // in [0, 2*Pi]
    vec2 v;
    v.x = cos(random); v.y = sin(random);
    return v;
}

// Computes the dot product of the distance and gradient vectors.
float dotGridGradient(int ix, int iy, float x, float y) {
    // Get gradient from integer coordinates
    vec2 gradient = randomGradient(ix, iy);

    // Compute the distance vector
    float dx = x - float(ix);
    float dy = y - float(iy);

    // Compute the dot-product
    return (dx*gradient.x + dy*gradient.y);
}

// Compute Perlin noise at coordinates x, y
float perlin(float x, float y) {
    // Determine grid cell coordinates
    int x0 = int(floor(x));
    int x1 = x0 + 1;
    int y0 = int(floor(y));
    int y1 = y0 + 1;

    // Determine interpolation weights
    // Could also use higher order polynomial/s-curve here
    float sx = x - float(x0);
    float sy = y - float(y0);

    // Interpolate between grid point gradients
    float n0, n1, ix0, ix1, value;

    n0 = dotGridGradient(x0, y0, x, y);
    n1 = dotGridGradient(x1, y0, x, y);
    ix0 = interpolate(n0, n1, sx);

    n0 = dotGridGradient(x0, y1, x, y);
    n1 = dotGridGradient(x1, y1, x, y);
    ix1 = interpolate(n0, n1, sx);

    value = interpolate(ix0, ix1, sy);
    return value; // Will return in range -1 to 1. To make it in range 0 to 1, multiply by 0.5 and add 0.5
}


void main()
{
    vec3 wCanvasPos = vec3((texCoords - 0.5) * wCanvasSize, 0.0);    // The canvas is always in z = 0 plane.
    vec3 wCanvasNormal = vec3(0, 0, -1);                            // The canvas is always facing ing -z direction.
    dvec2 wMirrorDelta = wMirrorSize / double(mirrorSampleResolution) * mirrorSampleAreaScale;    // The size of a single small square

    double M = 0.0;  // Irradiance of canvas point [W/m^2]
    for (int x = 0; x < mirrorSampleResolution; x++) {
        for (int y = 0; y < mirrorSampleResolution; y++) {
            vec2 mirrorUV = texCoords       // Most of the functions work with the [0, 1] uv coordinates.
                + (vec2(x, y) / float(mirrorSampleResolution) - 0.5) * mirrorSampleAreaScale
                
                + mirrorSampleAreaScale / float(mirrorSampleResolution)   // Apply noise to sampling
                * (2.0 * vec2(
                    perlin(1000.0 * texCoords.x  + x, 1000.0 * texCoords.y + y),
                    perlin(1000.0 * texCoords.x + x, 1000.0 * texCoords.y - y)
                ) - 1.0)
                
                ;
            if (mirrorUV.x < 0 || mirrorUV.x > 1 || mirrorUV.y < 0 || mirrorUV.y > 1) {
                continue;   // Skip this position if it is outside of the mirror area.
            }
            vec4 wNormHeight = normHeight(mirrorUV);
            vec3 wMirrorPos = vec3((mirrorUV - 0.5) * wMirrorSize, wNormHeight.w - wMirrorDistance);
            vec3 wMirrorNormal = wNormHeight.xyz;
            vec3 wToMirror = normalize(wMirrorPos - wCanvasPos);
            vec3 wToLight = normalize(wLightPos.xyz - wMirrorPos * wLightPos.w);    // Direction if wLightPos.w = 0.
            float wLightDitanceSquare = dot(wToLight, wToLight);
            vec3 wLightDir = wToLight / sqrt(wLightDitanceSquare );
            
            double a_x = length(vec3(wMirrorPos.xy, -wMirrorDistance) - vec3(wMirrorDelta.x, 0, 0) / 2.0 - wCanvasPos);
            double b_x = length(vec3(wMirrorPos.xy, -wMirrorDistance) + vec3(wMirrorDelta.x, 0, 0) / 2.0 - wCanvasPos);
            double c_x = wMirrorDelta.x;
            double delta_x = acos(float((a_x * a_x + b_x * b_x - c_x * c_x) / (2.0 * a_x * b_x)));  // Angle in x direction

            double a_y = length(vec3(wMirrorPos.xy, -wMirrorDistance) - vec3(0, wMirrorDelta.y, 0) / 2.0 - wCanvasPos);
            double b_y = length(vec3(wMirrorPos.xy, -wMirrorDistance) + vec3(0, wMirrorDelta.y, 0) / 2.0 - wCanvasPos);
            double c_y = wMirrorDelta.y;
            double delta_y = acos(float((a_y * a_y + b_y * b_y - c_y * c_y) / (2.0 * a_y * b_y)));  // Angle in y direction
            double omega = float(delta_x * delta_y);    // Solid angle

            double Lin =     // Radiance of mirror surface area
                lightPowerDensity / wLightDitanceSquare
                * max(dot(wLightDir, wMirrorNormal), 0)
                * mirrorBRDF(wLightDir, -wToMirror, wMirrorNormal);   // integral over Omega (M_l * cos(theta) * BRDF)
            M += double(max(dot(wToMirror, wCanvasNormal), 0)) * Lin * omega;    // integral over Omega [L_in * cos(theta)] d omega
        }
    }
    vec4 normHeight = normHeight(texCoords / wMirrorSize);
    IrradianceHeightOut = vec4(M, 0.5 + 100.0 * normHeight.w, 0, 1);  // ([W/m^2], [m])
    NormalOut = normHeight.xyz;
}