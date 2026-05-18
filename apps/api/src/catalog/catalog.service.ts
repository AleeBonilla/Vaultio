import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { serializeCourse } from "../common/serializers";

@Injectable()
export class CatalogService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async institutions() {
    const items = await this.prisma.institutions.findMany({
      where: { is_active: true },
      orderBy: { id: "asc" },
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        acronym: item.acronym,
        emailDomain: item.email_domain,
      })),
    };
  }

  async careers() {
    const items = await this.prisma.careers.findMany({
      where: { is_active: true },
      orderBy: { id: "asc" },
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        studyPlan: item.study_plan,
        institutionId: item.institution_id,
      })),
    };
  }

  async courses() {
    const items = await this.prisma.courses.findMany({
      where: { is_active: true },
      include: { course_careers: true },
      orderBy: { id: "asc" },
    });
    return { items: items.map(serializeCourse) };
  }

  async coursesByCareer(careerId: number) {
    const items = await this.prisma.courses.findMany({
      where: {
        is_active: true,
        course_careers: { some: { career_id: careerId } },
      },
      include: {
        course_careers: true,
        resources: { where: { is_active: true }, select: { id: true } },
      },
      orderBy: { id: "asc" },
    });
    return { items: items.map((course) => serializeCourse({ ...course, resourcesCount: course.resources.length })) };
  }

  async resourceTypes() {
    const items = await this.prisma.resource_types.findMany({ orderBy: { id: "asc" } });
    return { items: items.map((item) => ({ id: item.id, name: item.name, description: item.description })) };
  }

  async academicPeriods() {
    const items = await this.prisma.academic_periods.findMany({ orderBy: [{ year: "desc" }, { id: "asc" }] });
    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        year: item.year,
        institutionId: item.institution_id,
      })),
    };
  }

  async professors(courseId?: number) {
    const items = await this.prisma.professors.findMany({
      where: {
        is_active: true,
        ...(courseId ? { professor_courses: { some: { course_id: courseId, is_active: true } } } : {}),
      },
      include: { professor_courses: true },
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        courseIds: item.professor_courses.filter((course) => course.is_active).map((course) => course.course_id),
      })),
    };
  }
}
