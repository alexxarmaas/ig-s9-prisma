// S9 · PRISMA — Caleidoscopio de cristal
// GLSL ES 1.00. Diseñado para The Book of Shaders.
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Coordenadas con centro en el origen y aspecto conservado.
    vec2 p = (gl_FragCoord.xy - .5 * u_resolution)
             / min(u_resolution.x, u_resolution.y);

    // Coordenadas polares. Una vuelta de animación dura 2*PI segundos.
    float r = length(p);
    float a = atan(p.y, p.x) + u_time / 12.;
    float s = 3.14159 / 6.; // Apertura de cada uno de los 12 sectores.

    // Repite el sector y refleja su contenido, como un caleidoscopio.
    a = abs(mod(a, s) - s * .5);
    vec2 q = r * vec2(cos(a), sin(a));

    // Onda deformada que dibuja pétalos y contornos simétricos.
    float b = sin(32. * q.x + 9. * cos(18. * q.y - u_time));

    // Una segunda onda regula el tono de los contornos.
    float d = abs(sin(40. * q.y - 20. * r + u_time * .5));

    // Franja estrecha alrededor de las curvas de nivel de b.
    float v = 1. - smoothstep(.12, .27, abs(b));

    // Fondo azul marino + material turquesa + ribetes dorados.
    vec3 c = mix(vec3(.01, .03, .1), vec3(.08, .8, .75),
                 smoothstep(-.7, .9, b));
    gl_FragColor = vec4(c + vec3(1., .5, .2) * v * (.4 + .6 * d), 1.);
}
