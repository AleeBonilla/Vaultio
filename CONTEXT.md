# Vaultio Context

## Descripción General

Vaultio es una plataforma web diseñada para estudiantes del Instituto Tecnológico de Costa Rica (TEC), cuyo objetivo es centralizar, organizar y facilitar el intercambio de recursos académicos como:

- Apuntes
- Exámenes
- Ejercicios resueltos
- Resúmenes
- Código fuente

La plataforma está inspirada en sistemas como StuDocu y CourseHero, pero adaptada específicamente a la estructura académica y necesidades reales del TEC.

Vaultio busca resolver los problemas de fragmentación y desorganización causados por el uso actual de medios informales como:

- Carpetas de Google Drive
- Grupos de WhatsApp / Telegram
- Servidores de Discord
- Redes sociales

El proyecto nace originalmente dentro del curso Diseño de Software (IC-6821).

---

# Problema Principal

Actualmente los estudiantes del TEC enfrentan varios problemas al intentar acceder a material académico:

- Los recursos están dispersos en múltiples plataformas
- Los archivos están desorganizados
- Es difícil buscar material específico por curso
- Mucho contenido se pierde con el tiempo
- El acceso depende de grupos privados o contactos
- No existen mecanismos para validar la calidad del contenido
- Las plataformas globales no están contextualizadas al TEC

Vaultio busca resolver esto mediante:

- Organización estructurada
- Búsqueda y filtrado
- Ratings y comentarios
- Acceso centralizado
- Taxonomía académica institucional

---

# Diferenciador Principal

A diferencia de repositorios genéricos, Vaultio organiza el contenido según la estructura académica REAL del TEC.

Ejemplo de jerarquía:

Universidad
└── Carrera
└── Curso
└── Tipo de recurso
└── Recurso

Metadatos adicionales:

- Semestre
- Profesor
- Carrera
- Tipo de recurso
- Usuario que subió el material
- Ratings
- Comentarios

La contextualización institucional es el principal diferenciador competitivo del proyecto.

---

# Usuarios Objetivo

## 1. Estudiante de Primer Ingreso (Consumidor)

Características:

- Primeros semestres
- No posee red académica consolidada
- Depende de grupos de WhatsApp/Telegram

Necesidades:

- Encontrar material rápidamente
- Acceder a contenido organizado
- Descubrir recursos confiables

Comportamiento:

- Consume contenido
- Rara vez sube material

---

## 2. Estudiante Intermedio (Usuario Mixto)

Características:

- Ya conoce el ecosistema universitario
- Utiliza Google Drive y plataformas académicas externas

Necesidades:

- Acceso rápido a recursos estructurados
- Mejor filtrado y búsqueda

Comportamiento:

- Consume y ocasionalmente sube material

---

## 3. Estudiante Avanzado (Colaborador Activo)

Características:

- Posee gran cantidad de materiales académicos
- Participa en comunidades estudiantiles

Necesidades:

- Organizar y preservar contenido académico
- Ayudar a otros estudiantes
- Validar calidad del contenido

Comportamiento:

- Sube recursos
- Comenta y evalúa materiales
- Participa activamente en la comunidad

---

# Roles del Sistema

## Visitante

Usuario no autenticado.

Permisos:

- Navegar contenido público
- Realizar búsquedas básicas

---

## Estudiante Registrado

Usuario autenticado.

Permisos:

- Ver recursos completos
- Comentar
- Evaluar recursos

---

## Colaborador

Usuario que aporta contenido.

Permisos:

- Subir recursos
- Editar/eliminar sus recursos
- Comentar y evaluar

---

## Moderador (Futuro)

Rol orientado al control de calidad.

Permisos:

- Eliminar contenido
- Gestionar reportes
- Moderar interacciones

---

# Funcionalidades Principales

## Autenticación

- Registro de usuarios
- Inicio de sesión
- Futuro soporte para autenticación institucional

Posibles proveedores futuros:

- Google OAuth
- Microsoft / Outlook institucional

---

## Navegación Académica

Los usuarios podrán navegar por:

- Carreras
- Cursos
- Tipos de recurso
- Profesores

---

## Sistema de Subida de Recursos

Ejemplos de recursos soportados:

- Apuntes
- Exámenes
- Ejercicios resueltos
- Resúmenes
- Código técnico

Cada recurso estará asociado a:

- Curso
- Carrera
- Semestre
- Profesor
- Tipo de recurso

---

## Búsqueda y Filtrado

La búsqueda es uno de los pilares principales del sistema.

Filtros posibles:

- Curso
- Carrera
- Semestre
- Profesor
- Tipo de recurso
- Popularidad
- Ratings

Futuro:

- Búsqueda avanzada
- Recomendaciones
- Búsqueda semántica

---

## Ratings y Comentarios

Los usuarios podrán:

- Evaluar recursos
- Comentar recursos
- Validar calidad mediante interacción comunitaria

Esto resuelve una de las mayores carencias de los sistemas informales actuales.

---

# Análisis Competitivo

Vaultio fue comparado contra:

- StuDocu
- CourseHero
- Docsity
- Google Drive
- WhatsApp / Telegram
- Discord

Conclusiones principales:

- Las plataformas formales ofrecen buena búsqueda y UI
- Las plataformas informales ofrecen accesibilidad y rapidez
- Ninguna combina:
  - Estructura institucional
  - Acceso libre
  - Validación comunitaria
  - Contextualización TEC

Vaultio busca combinar todas esas fortalezas.

---

# Arquitectura de Contenidos

La arquitectura propuesta es jerárquica.

Ejemplo:

Vaultio
└── Carrera
└── Curso
└── Tipo de recurso
└── Recurso
├── Ratings
├── Comentarios
└── Metadatos

Metadatos importantes:

- Profesor
- Semestre
- Contexto académico
- Fecha de subida
- Autor/uploader

---

# Entidades Principales

## Usuario

Representa los usuarios del sistema.

Campos potenciales:

- id
- nombre
- email
- carrera_id
- reputación
- created_at

---

## Carrera

Programa académico.

Ejemplos:

- Ingeniería en Computación
- Ingeniería Electrónica

---

## Curso

Curso universitario.

Campos potenciales:

- id
- código
- nombre
- semestre
- carrera_id

---

## Recurso

Material académico subido por usuarios.

Campos potenciales:

- id
- título
- descripción
- file_url
- uploader_id
- course_id
- professor_id
- resource_type_id
- semester
- created_at

---

## TipoDeRecurso

Ejemplos:

- Apuntes
- Exámenes
- Ejercicios
- Resúmenes
- Código

---

## Comentario

Retroalimentación de usuarios sobre recursos.

---

## Rating

Evaluación de calidad de los recursos.

Posibles enfoques:

- 1–5 estrellas
- Likes/dislikes
- Reputación ponderada

---

## Profesor

Entidad contextual opcional asociada a cursos y recursos.

---

# Stack Tecnológico Inicial Propuesto

## Backend

- Node.js
- Express.js

## Frontend

- HTML/CSS/JavaScript
- Posible frontend en React

## Base de Datos

- PostgreSQL

## Control de Versiones

- Git
- GitHub

---

# Visión Arquitectónica Extendida

El proyecto puede evolucionar hacia:

- Sistemas de recomendación
- Búsqueda semántica
- IA aplicada a descubrimiento de contenido
- Multiuniversidad
- Sistemas de reputación
- Integración con repositorios externos

Posibles preocupaciones futuras:

- Escalabilidad
- Motores de búsqueda
- Object storage
- Moderación
- Identity federation
- Pipelines de recomendación

---

# Funcionalidades Futuras con IA

Posibles capacidades futuras:

- Búsqueda semántica
- Recomendaciones inteligentes
- Sugerencias personalizadas
- Clasificación automática de recursos
- Predicción de calidad
- Búsqueda en lenguaje natural

Ejemplo:
"Dame los mejores exámenes de Sistemas Operativos del semestre 2 con el profesor X"

---

# Validación del Proyecto

Se realizó una encuesta informal dentro de comunidades estudiantiles del TEC con resultados altamente positivos.

Los estudiantes mostraron interés especialmente en:

- Organización estructurada
- Filtros por profesor y semestre
- Descubrimiento de recursos
- Centralización del contenido académico

---

# Principios del Producto

## Accesibilidad

La plataforma debe mantenerse abierta y accesible para estudiantes del TEC.

---

## Contextualización Académica

La estructura académica del TEC es central en el diseño del sistema.

---

## Colaboración Comunitaria

La plataforma depende de la contribución y validación de la comunidad.

---

## Organización Estructurada

La calidad organizacional es una de las propuestas de valor principales.

---

# Visión a Largo Plazo

Vaultio puede evolucionar hacia:

- Un ecosistema académico completo
- Una plataforma multiuniversidad
- Un sistema educativo impulsado por IA
- Infraestructura colaborativa para aprendizaje

Posibles componentes futuros:

- Repositorios académicos
- Sistemas de reputación
- Recomendaciones de estudio
- Asistentes IA
- Analíticas académicas
- Comunidades colaborativas
