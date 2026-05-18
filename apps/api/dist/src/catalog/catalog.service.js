"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const serializers_1 = require("../common/serializers");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
        return { items: items.map(serializers_1.serializeCourse) };
    }
    async coursesByCareer(careerId) {
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
        return { items: items.map((course) => (0, serializers_1.serializeCourse)({ ...course, resourcesCount: course.resources.length })) };
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
    async professors(courseId) {
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
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
