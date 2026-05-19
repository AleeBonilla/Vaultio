-- ============================================================
-- VAULTIO — Datos Iniciales (Seed)
-- Archivo: seed.sql
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 1. INSTITUCIÓN
-- ────────────────────────────────────────────────────────────

INSERT INTO institutions (name, acronym, email_domain, is_active)
VALUES ('Instituto Tecnológico de Costa Rica', 'TEC', 'estudiantec.cr', TRUE);


-- ────────────────────────────────────────────────────────────
-- 2. CARRERAS (plan vigente TEC)
-- ────────────────────────────────────────────────────────────

INSERT INTO careers (code, name, study_plan, is_active, institution_id) VALUES
    ('IC',   'Ingeniería en Computación',                          '2024-IC',   TRUE, 1),
    ('IE',   'Ingeniería en Electrónica',                          '2024-IE',   TRUE, 1),
    ('IM',   'Ingeniería en Mecatrónica',                          '2024-IM',   TRUE, 1),
    ('IP',   'Ingeniería en Producción Industrial',                '2024-IP',   TRUE, 1),
    ('ICO',  'Ingeniería en Construcción',                         '2024-ICO',  TRUE, 1),
    ('IDI',  'Ingeniería en Diseño Industrial',                    '2024-IDI',  TRUE, 1),
    ('IBI',  'Ingeniería en Biotecnología',                        '2024-IBI',  TRUE, 1),
    ('IAM',  'Ingeniería Ambiental',                               '2024-IAM',  TRUE, 1),
    ('IMA',  'Ingeniería en Materiales',                           '2024-IMA',  TRUE, 1),
    ('AE',   'Administración de Empresas',                         '2024-AE',   TRUE, 1),
    ('ATI',  'Administración de Tecnología de Información',        '2024-ATI',  TRUE, 1),
    ('IF',   'Ingeniería Forestal',                                '2024-IF',   TRUE, 1),
    ('ISS',  'Ingeniería en Seguridad Laboral e Higiene Ambiental','2024-ISS',  TRUE, 1),
    ('IAgr', 'Ingeniería Agrícola',                                '2024-IAgr', TRUE, 1),
    ('IA',   'Ingeniería en Agronomía',                            '2024-IA',   TRUE, 1);


-- ────────────────────────────────────────────────────────────
-- 3. CURSOS DE EJEMPLO (Computación)
-- ────────────────────────────────────────────────────────────

INSERT INTO courses (code, name, is_active) VALUES
    ('IC-1800', 'Introducción a la Programación',         TRUE),
    ('IC-1802', 'Programación Orientada a Objetos',       TRUE),
    ('IC-2001', 'Estructuras de Datos',                   TRUE),
    ('IC-3002', 'Análisis de Algoritmos',                 TRUE),
    ('IC-4301', 'Bases de Datos I',                       TRUE),
    ('IC-4302', 'Bases de Datos II',                      TRUE),
    ('IC-6821', 'Diseño de Software',                     TRUE),
    ('IC-6831', 'Ingeniería de Software',                 TRUE),
    ('IC-7602', 'Redes',                                  TRUE),
    ('IC-5701', 'Compiladores e Intérpretes',             TRUE),
    ('MA-0101', 'Matemática General',                     TRUE),
    ('MA-1102', 'Cálculo Diferencial e Integral',         TRUE),
    ('MA-1103', 'Cálculo y Álgebra Lineal',               TRUE),
    ('FI-0101', 'Física General I',                       TRUE),
    ('FI-0102', 'Física General II',                      TRUE),
    ('CI-0101', 'Comunicación Técnica',                   TRUE);


-- Asociar cursos a carrera IC
INSERT INTO course_careers (course_id, career_id)
SELECT c.id, cr.id
FROM courses c, careers cr
WHERE cr.code = 'IC'
  AND c.code IN (
    'IC-1800','IC-1802','IC-2001','IC-3002',
    'IC-4301','IC-4302','IC-6821','IC-6831',
    'IC-7602','IC-5701',
    'MA-0101','MA-1102','MA-1103',
    'FI-0101','FI-0102','CI-0101'
  );


-- ────────────────────────────────────────────────────────────
-- 4. PERÍODOS ACADÉMICOS
-- ────────────────────────────────────────────────────────────

INSERT INTO academic_periods (name, year, institution_id) VALUES
    ('I Semestre 2025',  2025, 1),
    ('II Semestre 2025', 2025, 1),
    ('Verano 2025',      2025, 1),
    ('I Semestre 2026',  2026, 1),
    ('II Semestre 2026', 2026, 1);


-- ────────────────────────────────────────────────────────────
-- 5. TIPOS DE RECURSO
-- ────────────────────────────────────────────────────────────

INSERT INTO resource_types (name, description) VALUES
    ('Apuntes',              'Notas de clase tomadas por estudiantes'),
    ('Exámenes anteriores',  'Parciales y finales de semestres pasados'),
    ('Resúmenes',            'Síntesis de temas o unidades del curso'),
    ('Ejercicios resueltos', 'Problemas con solución paso a paso'),
    ('Código fuente',        'Proyectos, tareas y snippets de programación');


-- ────────────────────────────────────────────────────────────
-- 6. ROLES
-- ────────────────────────────────────────────────────────────

INSERT INTO roles (name, is_active) VALUES
    ('visitante',   TRUE),
    ('estudiante',  TRUE),
    ('colaborador', TRUE),
    ('moderador',   TRUE);


-- ────────────────────────────────────────────────────────────
-- 7. PERMISOS
-- ────────────────────────────────────────────────────────────

INSERT INTO permissions (code, is_active) VALUES
    -- Recursos
    ('resource:read',        TRUE),
    ('resource:create',      TRUE),
    ('resource:update_own',  TRUE),
    ('resource:delete_own',  TRUE),
    ('resource:delete_any',  TRUE),
    -- Comentarios
    ('comment:read',         TRUE),
    ('comment:create',       TRUE),
    ('comment:update_own',   TRUE),
    ('comment:delete_own',   TRUE),
    ('comment:delete_any',   TRUE),
    -- Ratings
    ('rating:read',          TRUE),
    ('rating:create',        TRUE),
    ('rating:update_own',    TRUE),
    ('rating:delete_own',    TRUE),
    -- Reportes
    ('report:create',        TRUE),
    ('report:manage',        TRUE),
    -- Perfil
    ('profile:read',         TRUE),
    ('profile:update_own',   TRUE),
    ('profile:delete_own',   TRUE),
    -- Guardados / descargas
    ('save:create',          TRUE),
    ('download:create',      TRUE);


-- ────────────────────────────────────────────────────────────
-- 8. PERMISOS POR ROL
-- ────────────────────────────────────────────────────────────

-- Visitante: solo lectura
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'visitante'
  AND p.code IN ('resource:read', 'comment:read', 'rating:read');

-- Estudiante: lectura + interacciones
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'estudiante'
  AND p.code IN (
    'resource:read',
    'comment:read',    'comment:create', 'comment:update_own', 'comment:delete_own',
    'rating:read',     'rating:create',  'rating:update_own',  'rating:delete_own',
    'report:create',
    'profile:read',    'profile:update_own', 'profile:delete_own',
    'save:create',     'download:create'
  );

-- Colaborador: todo de estudiante + CRUD de recursos propios
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'colaborador'
  AND p.code IN (
    'resource:read',   'resource:create', 'resource:update_own', 'resource:delete_own',
    'comment:read',    'comment:create',  'comment:update_own',  'comment:delete_own',
    'rating:read',     'rating:create',   'rating:update_own',   'rating:delete_own',
    'report:create',
    'profile:read',    'profile:update_own', 'profile:delete_own',
    'save:create',     'download:create'
  );

-- Moderador: todo + eliminar cualquier contenido + gestionar reportes
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'moderador'
  AND p.code IN (
    'resource:read',   'resource:create', 'resource:update_own', 'resource:delete_own', 'resource:delete_any',
    'comment:read',    'comment:create',  'comment:update_own',  'comment:delete_own',  'comment:delete_any',
    'rating:read',     'rating:create',   'rating:update_own',   'rating:delete_own',
    'report:create',   'report:manage',
    'profile:read',    'profile:update_own', 'profile:delete_own',
    'save:create',     'download:create'
  );


-- ────────────────────────────────────────────────────────────
-- 9. PROFESORES DE EJEMPLO (Computación)
-- ────────────────────────────────────────────────────────────

INSERT INTO professors (first_name, last_name, is_active) VALUES
    ('Eduardo',   'Canessa Montero',    TRUE),
    ('Mauricio',  'Avilés Cervantes',   TRUE),
    ('Kevin',     'Moraga López',       TRUE),
    ('Nereo',     'Campos Araya',       TRUE),
    ('Ricardo',   'Villalón Fonseca',   TRUE);

-- Asociar profesores a cursos
INSERT INTO professor_courses (professor_id, course_id, is_active)
SELECT p.id, c.id, TRUE
FROM professors p, courses c
WHERE (p.last_name LIKE 'Canessa%'    AND c.code = 'IC-6821')
   OR (p.last_name LIKE 'Avilés%'     AND c.code = 'IC-4301')
   OR (p.last_name LIKE 'Moraga%'     AND c.code = 'IC-2001')
   OR (p.last_name LIKE 'Campos%'     AND c.code = 'IC-1800')
   OR (p.last_name LIKE 'Villalón%'   AND c.code = 'IC-3002');


COMMIT;
INSERT INTO resource_types (name, description) VALUES
    ('Presentaciones',       'Diapositivas y material expositivo'),
    ('Libros y lecturas',    'Libros, capitulos y lecturas complementarias'),
    ('Guias de estudio',     'Listas de temas, objetivos o rutas de repaso'),
    ('Laboratorios',         'Practicas, reportes y materiales de laboratorio'),
    ('Tareas',               'Enunciados, soluciones y entregables de tareas'),
    ('Proyectos',            'Proyectos finales o parciales del curso'),
    ('Imagenes',             'Diagramas, capturas, infografias o imagenes utiles'),
    ('Dataset',              'Datos, CSV, hojas de calculo y archivos tabulares'),
    ('Link externo',         'Enlaces a recursos externos confiables')
ON CONFLICT (name) DO NOTHING;
