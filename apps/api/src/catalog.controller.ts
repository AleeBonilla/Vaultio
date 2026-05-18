import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

@Controller("catalog")
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalog: CatalogService) {}

  @Get("institutions")
  institutions() {
    return this.catalog.institutions();
  }

  @Get("careers")
  careers() {
    return this.catalog.careers();
  }

  @Get("careers/:careerId/courses")
  coursesByCareer(@Param("careerId") careerId: string) {
    return this.catalog.coursesByCareer(Number(careerId));
  }

  @Get("courses")
  courses() {
    return this.catalog.courses();
  }

  @Get("resource-types")
  resourceTypes() {
    return this.catalog.resourceTypes();
  }

  @Get("academic-periods")
  academicPeriods() {
    return this.catalog.academicPeriods();
  }

  @Get("professors")
  professors(@Query("courseId") courseId?: string) {
    return this.catalog.professors(courseId ? Number(courseId) : undefined);
  }
}
