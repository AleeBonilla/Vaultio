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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdminService = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const common_1 = require("@nestjs/common");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const config_1 = require("../config");
const errors_1 = require("../common/errors");
let FirebaseAdminService = class FirebaseAdminService {
    constructor() {
        this.initialize();
    }
    async verifyIdToken(idToken) {
        try {
            return await (0, auth_1.getAuth)().verifyIdToken(idToken);
        }
        catch {
            (0, errors_1.unauthorized)("Token de Firebase invalido");
        }
    }
    initialize() {
        if ((0, app_1.getApps)().length)
            return;
        const serviceAccountPath = config_1.config.auth.firebaseServiceAccountPath;
        if (!node_fs_1.default.existsSync(serviceAccountPath)) {
            (0, errors_1.unauthorized)("Credenciales de Firebase Admin no configuradas");
        }
        const serviceAccount = JSON.parse(node_fs_1.default.readFileSync(serviceAccountPath, "utf8"));
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
        });
    }
};
exports.FirebaseAdminService = FirebaseAdminService;
exports.FirebaseAdminService = FirebaseAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseAdminService);
