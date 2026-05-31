import { Inject, Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const demoUsers = {
  maria: "11111111-1111-4111-8111-111111111111",
  carlos: "22222222-2222-4222-8222-222222222222",
};

const demoResources = {
  examen: "33333333-3333-4333-8333-333333333333",
  apuntes: "44444444-4444-4444-8444-444444444444",
};

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      await this.seed();
      this.logger.log('Base de datos inicializada/actualizada con datos semilla.');
    } catch (error: any) {
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
        this.logger.warn('No se pudo conectar a la base de datos durante el seeding (ECONNREFUSED). Asegúrate de que PostgreSQL esté corriendo.');
      } else {
        this.logger.warn(`Error ejecutando el seeding al iniciar: ${error.message}`);
      }
    }
  }

  async seed() {
    await this.seedCatalogs();
    await this.seedUsers();
    await this.seedResources();
  }

  private async seedCatalogs() {
    await this.prisma.institutions.upsert({
      where: { id: 1 },
      update: {
        name: "Instituto Tecnológico de Costa Rica",
        acronym: "TEC",
        email_domain: "estudiantec.cr",
        is_active: true,
      },
      create: {
        id: 1,
        name: "Instituto Tecnológico de Costa Rica",
        acronym: "TEC",
        email_domain: "estudiantec.cr",
      },
    });

    const careers = [
      { id: 1, code: "IC", name: "Ingeniería en Computación", study_plan: "2024-IC" },
      { id: 2, code: "IE", name: "Ingeniería en Electrónica", study_plan: "2024-IE" },
      { id: 3, code: "IM", name: "Ingeniería en Mecatrónica", study_plan: "2024-IM" },
      { id: 4, code: "IP", name: "Ingeniería en Producción Industrial", study_plan: "2024-IP" },
      { id: 5, code: "ATI", name: "Administración de Tecnología de Información", study_plan: "2024-ATI" },
    ];

    for (const career of careers) {
      await this.prisma.careers.upsert({
        where: {
          institution_id_code_study_plan: {
            institution_id: 1,
            code: career.code,
            study_plan: career.study_plan,
          },
        },
        update: { name: career.name, is_active: true },
        create: { ...career, institution_id: 1 },
      });
    }

    const courses = [
      { id: 1, code: "IC-1800", name: "Introducción a la Programación", careerIds: [1] },
      { id: 2, code: "IC-1802", name: "Programación Orientada a Objetos", careerIds: [1] },
      { id: 3, code: "IC-2001", name: "Estructuras de Datos", careerIds: [1] },
      { id: 4, code: "IC-3002", name: "Análisis de Algoritmos", careerIds: [1] },
      { id: 5, code: "IC-4301", name: "Bases de Datos I", careerIds: [1, 5] },
      { id: 6, code: "IC-6821", name: "Diseño de Software", careerIds: [1, 5] },
      { id: 7, code: "MA-1102", name: "Cálculo Diferencial e Integral", careerIds: [1, 2, 3, 4] },
    ];

    for (const course of courses) {
      await this.prisma.courses.upsert({
        where: { code: course.code },
        update: { name: course.name, is_active: true },
        create: { id: course.id, code: course.code, name: course.name },
      });

      for (const careerId of course.careerIds) {
        await this.prisma.course_careers.upsert({
          where: { course_id_career_id: { course_id: course.id, career_id: careerId } },
          update: {},
          create: { course_id: course.id, career_id: careerId },
        });
      }
    }

    const professors = [
      { id: 1, first_name: "Eduardo", last_name: "Canessa Montero", courseIds: [6] },
      { id: 2, first_name: "Mauricio", last_name: "Aviles Cervantes", courseIds: [5] },
      { id: 3, first_name: "Kevin", last_name: "Moraga Lopez", courseIds: [3] },
      { id: 4, first_name: "Nereo", last_name: "Campos Araya", courseIds: [1] },
      { id: 5, first_name: "Ricardo", last_name: "Villalon Fonseca", courseIds: [4] },
    ];

    for (const professor of professors) {
      await this.prisma.professors.upsert({
        where: { id: professor.id },
        update: {
          first_name: professor.first_name,
          last_name: professor.last_name,
          is_active: true,
        },
        create: {
          id: professor.id,
          first_name: professor.first_name,
          last_name: professor.last_name,
        },
      });

      for (const courseId of professor.courseIds) {
        await this.prisma.professor_courses.upsert({
          where: { professor_id_course_id: { professor_id: professor.id, course_id: courseId } },
          update: { is_active: true },
          create: { professor_id: professor.id, course_id: courseId },
        });
      }
    }

    const resourceTypes = [
      { id: 1, name: "Apuntes", description: "Notas de clase tomadas por estudiantes" },
      { id: 2, name: "Exámenes anteriores", description: "Parciales y finales de semestres pasados" },
      { id: 3, name: "Resúmenes", description: "Síntesis de temas o unidades del curso" },
      { id: 4, name: "Ejercicios resueltos", description: "Problemas con solución paso a paso" },
      { id: 5, name: "Código fuente", description: "Proyectos y snippets de programación" },
      { id: 6, name: "Presentaciones", description: "Diapositivas y material expositivo" },
      { id: 7, name: "Libros y lecturas", description: "Libros, capítulos y lecturas complementarias" },
      { id: 8, name: "Guías de estudio", description: "Rutas de repaso y listas de temas" },
      { id: 9, name: "Laboratorios", description: "Prácticas, reportes y materiales de laboratorio" },
      { id: 10, name: "Tareas", description: "Enunciados, soluciones y entregables" },
      { id: 11, name: "Proyectos", description: "Proyectos finales o parciales del curso" },
      { id: 12, name: "Imágenes", description: "Diagramas, capturas e infografías" },
      { id: 13, name: "Dataset", description: "Datos, CSV y archivos tabulares" },
      { id: 14, name: "Link externo", description: "Enlaces a recursos externos confiables" },
    ];

    for (const type of resourceTypes) {
      await this.prisma.resource_types.upsert({
        where: { name: type.name },
        update: { description: type.description },
        create: type,
      });
    }

    const periods = [
      { id: 1, name: "I Semestre 2025", year: 2025 },
      { id: 2, name: "II Semestre 2025", year: 2025 },
      { id: 3, name: "I Semestre 2026", year: 2026 },
    ];

    for (const period of periods) {
      await this.prisma.academic_periods.upsert({
        where: { id: period.id },
        update: { name: period.name, year: period.year, institution_id: 1 },
        create: { ...period, institution_id: 1 },
      });
    }

    for (const role of ["estudiante", "moderador"]) {
      await this.prisma.roles.upsert({
        where: { name: role },
        update: { is_active: true },
        create: { name: role },
      });
    }
  }

  private async seedUsers() {
    const users = [
      {
        id: demoUsers.maria,
        username: "maria",
        first_name: "Maria",
        last_name: "Gonzalez",
        email: "maria@estudiantec.cr",
        role: "moderador",
        careerId: 1,
        reputation_score: 18,
      },
      {
        id: demoUsers.carlos,
        username: "carlos",
        first_name: "Carlos",
        last_name: "Mora",
        email: "carlos@estudiantec.cr",
        role: "estudiante",
        careerId: 1,
        reputation_score: 6,
      },
    ];

    for (const user of users) {
      await this.prisma.users.upsert({
        where: { id: user.id },
        update: {
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          reputation_score: user.reputation_score,
          is_active: true,
        },
        create: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          reputation_score: user.reputation_score,
        },
      });

      await this.prisma.identities.upsert({
        where: {
          provider_name_provider_uid: {
            provider_name: "demo_password",
            provider_uid: user.email,
          },
        },
        update: { email: user.email, is_active: true, last_login: new Date(), user_id: user.id },
        create: {
          provider_name: "demo_password",
          provider_uid: user.email,
          email: user.email,
          user_id: user.id,
        },
      });

      await this.prisma.user_careers.upsert({
        where: { user_id_career_id: { user_id: user.id, career_id: user.careerId } },
        update: { is_active: true },
        create: { user_id: user.id, career_id: user.careerId },
      });

      const role = await this.prisma.roles.findUniqueOrThrow({ where: { name: user.role } });
      await this.prisma.user_roles.upsert({
        where: { role_id_user_id: { role_id: role.id, user_id: user.id } },
        update: { is_active: true },
        create: { role_id: role.id, user_id: user.id },
      });
    }
  }

  private async seedResources() {
    const now = new Date();
    const resources = [
      {
        id: demoResources.examen,
        title: "Examen final 2025 resuelto",
        description:
          "Examen final de Estructuras de Datos con soluciones detalladas y explicación paso a paso.",
        tags: ["examen", "final", "estructuras"],
        storage_key: "resources/demo/examen-final-2025.pdf",
        original_filename: "examen-final-2025.pdf",
        file_url: "https://example.com/demo/examen-final-2025.pdf",
        file_size: BigInt(2_400_000),
        views_count: BigInt(1205),
        downloads_count: BigInt(234),
        professor_id: 3,
        user_id: demoUsers.maria,
        academic_period_id: 1,
        course_id: 3,
        resource_type_id: 2,
      },
      {
        id: demoResources.apuntes,
        title: "Apuntes completos de Bases de Datos I",
        description: "Resumen de SQL, normalización, transacciones e índices para preparar exámenes.",
        tags: ["sql", "normalización", "índices"],
        storage_key: "resources/demo/apuntes-bases-datos.pdf",
        original_filename: "apuntes-bases-datos.pdf",
        file_url: "https://example.com/demo/apuntes-bases-datos.pdf",
        file_size: BigInt(1_800_000),
        views_count: BigInt(876),
        downloads_count: BigInt(190),
        professor_id: 2,
        user_id: demoUsers.carlos,
        academic_period_id: 2,
        course_id: 5,
        resource_type_id: 1,
      },
    ];

    for (const resource of resources) {
      await this.prisma.resources.upsert({
        where: { id: resource.id },
        update: {
          title: resource.title,
          description: resource.description,
          tags: resource.tags,
          is_active: true,
        },
        create: {
          ...resource,
          storage_provider: "minio",
          storage_bucket: "vaultio-demo",
          mime_type: "application/pdf",
          file_extension: "pdf",
          upload_status: "ready",
          created_at: now,
          updated_at: now,
        },
      });
    }

    await this.prisma.comments.upsert({
      where: { id: "55555555-5555-4555-8555-555555555555" },
      update: { content: "Muy útil para practicar antes del final.", is_active: true },
      create: {
        id: "55555555-5555-4555-8555-555555555555",
        resource_id: demoResources.examen,
        user_id: demoUsers.carlos,
        content: "Muy útil para practicar antes del final.",
      },
    });

    await this.prisma.ratings.upsert({
      where: { user_id_resource_id: { user_id: demoUsers.carlos, resource_id: demoResources.examen } },
      update: { stars: 5 },
      create: {
        id: "66666666-6666-4666-8666-666666666666",
        resource_id: demoResources.examen,
        user_id: demoUsers.carlos,
        stars: 5,
      },
    });

    await this.prisma.ratings.upsert({
      where: { user_id_resource_id: { user_id: demoUsers.maria, resource_id: demoResources.apuntes } },
      update: { stars: 4 },
      create: {
        id: "77777777-7777-4777-8777-777777777777",
        resource_id: demoResources.apuntes,
        user_id: demoUsers.maria,
        stars: 4,
      },
    });
  }
}
