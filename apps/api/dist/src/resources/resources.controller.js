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
exports.ResourcesController = void 0;
const common_1 = require("@nestjs/common");
const resources_service_1 = require("./resources.service");
let ResourcesController = class ResourcesController {
    resources;
    constructor(resources) {
        this.resources = resources;
    }
    list(query) {
        return this.resources.list(query);
    }
    detail(authorization, id) {
        return this.resources.detail(id, authorization);
    }
    create(authorization, body) {
        return this.resources.create(authorization, body);
    }
    update(authorization, id, body) {
        return this.resources.update(authorization, id, body);
    }
    delete(authorization, id) {
        return this.resources.delete(authorization, id);
    }
    download(authorization, id) {
        return this.resources.download(authorization, id);
    }
    rate(authorization, id, body) {
        return this.resources.rate(authorization, id, body);
    }
    save(authorization, id) {
        return this.resources.save(authorization, id);
    }
    unsave(authorization, id) {
        return this.resources.unsave(authorization, id);
    }
    comments(id) {
        return this.resources.comments(id);
    }
    createComment(authorization, id, body) {
        return this.resources.createComment(authorization, id, body);
    }
    voteComment(authorization, id, commentId, body) {
        return this.resources.voteComment(authorization, id, commentId, body);
    }
    unvoteComment(authorization, id, commentId) {
        return this.resources.unvoteComment(authorization, id, commentId);
    }
    deleteComment(authorization, id, commentId) {
        return this.resources.deleteComment(authorization, id, commentId);
    }
};
exports.ResourcesController = ResourcesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(":id/download"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "download", null);
__decorate([
    (0, common_1.Post)(":id/ratings"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "rate", null);
__decorate([
    (0, common_1.Post)(":id/save"),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "save", null);
__decorate([
    (0, common_1.Delete)(":id/save"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "unsave", null);
__decorate([
    (0, common_1.Get)(":id/comments"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "comments", null);
__decorate([
    (0, common_1.Post)(":id/comments"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "createComment", null);
__decorate([
    (0, common_1.Post)(":id/comments/:commentId/vote"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("commentId")),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "voteComment", null);
__decorate([
    (0, common_1.Delete)(":id/comments/:commentId/vote"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("commentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "unvoteComment", null);
__decorate([
    (0, common_1.Delete)(":id/comments/:commentId"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Param)("commentId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ResourcesController.prototype, "deleteComment", null);
exports.ResourcesController = ResourcesController = __decorate([
    (0, common_1.Controller)("resources"),
    __param(0, (0, common_1.Inject)(resources_service_1.ResourcesService)),
    __metadata("design:paramtypes", [resources_service_1.ResourcesService])
], ResourcesController);
