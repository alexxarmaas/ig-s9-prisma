# PRISMA — Caleidoscopio geométrico animado

**Informática Gráfica · Sesión 9 · Shaders GLSL**

![Vista previa animada de PRISMA](capturas/prisma-animado.gif)

PRISMA es un caleidoscopio digital desarrollado mediante un *fragment shader* en GLSL. Genera un patrón de simetría radial compuesto por formas curvas, tonalidades turquesas y contornos dorados que cambian progresivamente con el tiempo.

La imagen se genera mediante operaciones matemáticas aplicadas individualmente a cada fragmento, sin utilizar texturas ni modelos tridimensionales.

## Demostración

El proyecto incluye una visualización interactiva que permite observar el comportamiento del shader en tiempo real.

Puedes visualizar el caleidoscopio funcionando en el siguiente enlace:

[Ver PRISMA en funcionamiento](https://alexxarmaas.github.io/ig-s9-prisma/)

- **Visualización WebGL:** ejecutar `index.html` o `vista-previa.html` en un navegador compatible con WebGL. La demostración permite pausar la animación, reiniciarla, modificar su velocidad y activar la pantalla completa.

- **Editor GLSL:** el código de `shader.frag` y `shader.min.frag` puede ejecutarse en el [editor de The Book of Shaders](https://editor.thebookofshaders.com/).

La animación de cabecera es una representación visual del patrón generada mediante las mismas expresiones matemáticas utilizadas por el shader.

## Objetivos

El objetivo principal de la práctica consiste en desarrollar un *fragment shader* capaz de producir patrones generativos con un comportamiento dinámico.

Para ello, se han establecido los siguientes objetivos:

1. Generar una composición geométrica mediante coordenadas y funciones matemáticas.

2. Implementar un efecto de simetría radial que permita repetir formas alrededor de un punto central.

3. Incorporar animaciones utilizando una variable temporal.

4. Aplicar transiciones suaves y combinaciones de colores para mejorar el resultado visual.

5. Optimizar el código GLSL para ajustarlo al límite de 512 bytes propuesto en la modalidad *tiny code*.

## Motivación y diseño visual

La idea del proyecto surge del funcionamiento de los caleidoscopios ópticos, donde la reflexión de una imagen mediante varios espejos produce patrones repetitivos y simétricos.

Se ha intentado trasladar este concepto a una representación digital, aprovechando las posibilidades de los shaders para generar formas mediante funciones matemáticas.

Para el diseño visual se ha buscado una estética similar a una vidriera, utilizando formas concéntricas semejantes a pétalos y bordes luminosos.

La composición utiliza principalmente tres colores:

- **Azul marino:** constituye el fondo y aporta contraste.

- **Turquesa:** representa las formas principales del patrón.

- **Dorado:** destaca los contornos y proporciona un efecto luminoso.

La animación combina una rotación lenta de la composición con variaciones periódicas de las formas y de la intensidad de sus contornos.

## Desarrollo del shader

El funcionamiento del caleidoscopio se divide en varias etapas: normalización de coordenadas, transformación polar, aplicación de simetría, generación de formas y cálculo del color.

### 1. Normalización de coordenadas

Cada fragmento dispone de una posición en pantalla, accesible mediante `gl_FragCoord.xy`.

Para facilitar los cálculos, se traslada el origen de coordenadas al centro de la ventana y se normalizan las posiciones utilizando la menor dimensión del lienzo.

```glsl

vec2 p = (gl_FragCoord.xy - .5 * u_resolution)

         / min(u_resolution.x, u_resolution.y);

```

De esta forma, el centro de la pantalla corresponde a la posición `(0, 0)`.

Además, utilizar la menor dimensión permite conservar las proporciones del dibujo independientemente de la resolución o de la relación de aspecto de la ventana.

### 2. Coordenadas polares y simetría radial

Para implementar el efecto caleidoscópico se utilizan coordenadas polares.

En lugar de trabajar únicamente con las coordenadas cartesianas `x` e `y`, se calcula la distancia de cada fragmento al centro y su ángulo respecto al eje horizontal.

```glsl

float r = length(p);

float a = atan(p.y, p.x) + u_time / 12.;

float s = 3.14159 / 6.;

a = abs(mod(a, s) - s * .5);

vec2 q = r * vec2(cos(a), sin(a));

```

La función `length()` calcula la distancia al origen, mientras que `atan()` permite obtener el ángulo correspondiente.

La variable `s` establece una apertura angular de `π/6` radianes, equivalente a 30 grados, dividiendo la circunferencia en **12 sectores**.

Posteriormente, la combinación de `mod()` y `abs()` permite repetir y reflejar las coordenadas angulares dentro de cada sector.

De esta manera, una misma forma puede reproducirse alrededor del centro sin necesidad de generar individualmente cada una de sus copias.

La variable `u_time` introduce una variación progresiva del ángulo, provocando la rotación de la composición.

### 3. Generación de las formas

Una vez establecidas las coordenadas transformadas, se utilizan funciones trigonométricas para crear el patrón geométrico.

```glsl

float b = sin(32. * q.x + 9. * cos(18. * q.y - u_time));

float d = abs(sin(40. * q.y - 20. * r + u_time * .5));

```

La primera expresión combina las funciones `sin()` y `cos()` para generar bandas curvas que varían según la posición del fragmento.

La segunda expresión añade variaciones adicionales que afectan a la intensidad de los contornos.

Ambas expresiones dependen de `u_time`, por lo que sus resultados evolucionan de manera continua durante la ejecución.

Esto permite obtener una animación sin modificar manualmente la geometría ni actualizar individualmente los píxeles desde JavaScript.

### 4. Suavizado de bordes

Para conseguir una transición más progresiva entre las formas y el fondo se utiliza la función `smoothstep()`.

```glsl

float v = 1. - smoothstep(.12, .27, abs(b));

```

Esta función genera una transición suave entre dos valores.

En este caso, permite identificar determinadas zonas de las curvas y generar una intensidad que disminuye gradualmente hacia el exterior.

El resultado evita transiciones excesivamente abruptas y permite destacar los bordes del patrón.

### 5. Aplicación del color

El color final se calcula combinando una transición entre dos colores principales con una componente adicional para los contornos luminosos.

```glsl

vec3 c = mix(

    vec3(.01, .03, .1),

    vec3(.08, .8, .75),

    smoothstep(-.7, .9, b)

);

gl_FragColor = vec4(

    c + vec3(1., .5, .2) * v * (.4 + .6 * d),

    1.

);

```

La función `mix()` interpola entre el azul marino y el turquesa, tomando como referencia el resultado de la función de generación de formas.

Posteriormente, se añade una componente dorada cuya intensidad depende de las variables `v` y `d`.

Esta combinación permite destacar determinadas regiones del patrón y obtener el aspecto luminoso característico de PRISMA.

El resultado se almacena finalmente en `gl_FragColor`, que establece el color correspondiente al fragmento procesado.

## Animación

El comportamiento dinámico se consigue mediante la variable uniforme `u_time`, cuyo valor representa el tiempo transcurrido durante la ejecución.

Esta variable interviene en diferentes operaciones del shader, produciendo principalmente:

- Una rotación continua del patrón alrededor del centro.

- Variaciones periódicas de las formas geométricas.

- Cambios en la intensidad de los contornos luminosos.

La animación se calcula directamente en la GPU. El código JavaScript de la visualización se encarga de inicializar el contexto WebGL, dibujar la superficie sobre la que se aplica el shader y actualizar las variables uniformes.

## Optimización: tiny code

Una vez definido el funcionamiento del caleidoscopio, se ha preparado una versión compacta del shader con el objetivo de cumplir la restricción opcional de 512 bytes.

La optimización se ha realizado principalmente mediante:

- Reducción de espacios y saltos de línea innecesarios.

- Utilización de nombres cortos para las variables.

- Simplificación de expresiones matemáticas.

- Eliminación de comentarios en la versión compacta.

- Reutilización de resultados intermedios.

El proyecto incluye dos versiones del mismo shader:
| Versión | Archivo | Descripción |
|---|---|---|
| Legible | `shader.frag` | Código organizado y comentado para facilitar su comprensión |
| Compacta | `shader.min.frag` | Versión optimizada de 511 bytes |

La versión compacta ocupa **511 bytes**, incluyendo las declaraciones de los `uniforms`, por lo que se mantiene dentro del límite establecido.

La versión compacta ocupa **511 bytes**, incluyendo las declaraciones de los `uniforms`, por lo que se mantiene dentro del límite establecido.

## Estructura del proyecto

```text

ig-s9-prisma/

├── README.md

├── shader.frag

├── shader.min.frag

├── index.html

├── vista-previa.html

└── capturas/

    ├── prisma-animado.gif

    └── prisma-poster.png

```

Los archivos GLSL contienen la implementación del efecto, mientras que los archivos HTML permiten visualizarlo desde un navegador mediante WebGL.

La carpeta `capturas` contiene los recursos gráficos utilizados para presentar el resultado.

## Referencias

- Otsedom. [Informática Gráfica — Sesión 9: Shaders](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S9/README.md). Guion de la práctica y ejemplos de shaders.

- Patricio Gonzalez Vivo y Jen Lowe. [The Book of Shaders](https://thebookofshaders.com/). Introducción a GLSL, generación de patrones y funciones matemáticas.

- [The Book of Shaders — Patterns](https://thebookofshaders.com/09/). Técnicas de repetición y generación de patrones mediante coordenadas.

- [The Book of Shaders — Shaping Functions](https://thebookofshaders.com/05/). Funciones matemáticas para la definición de formas y transiciones.

- [Khronos — OpenGL ES Shading Language](https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf). Especificación del lenguaje GLSL ES 1.00.
