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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
let CatalogController = class CatalogController {
    catalog;
    constructor(catalog) {
        this.catalog = catalog;
    }
    institutions() {
        return this.catalog.institutions();
    }
    careers() {
        return this.catalog.careers();
    }
    coursesByCareer(careerId) {
        return this.catalog.coursesByCareer(Number(careerId));
    }
    courses() {
        return this.catalog.courses();
    }
    resourceTypes() {
        return this.catalog.resourceTypes();
    }
    academicPeriods() {
        return this.catalog.academicPeriods();
    }
    professors(courseId) {
        return this.catalog.professors(courseId ? Number(courseId) : undefined);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)("institutions"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "institutions", null);
__decorate([
    (0, common_1.Get)("careers"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "careers", null);
__decorate([
    (0, common_1.Get)("careers/:careerId/courses"),
    __param(0, (0, common_1.Param)("careerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "coursesByCareer", null);
__decorate([
    (0, common_1.Get)("courses"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "courses", null);
__decorate([
    (0, common_1.Get)("resource-types"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "resourceTypes", null);
__decorate([
    (0, common_1.Get)("academic-periods"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "academicPeriods", null);
__decorate([
    (0, common_1.Get)("professors"),
    __param(0, (0, common_1.Query)("courseId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "professors", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)("catalog"),
    __param(0, (0, common_1.Inject)(catalog_service_1.CatalogService)),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
