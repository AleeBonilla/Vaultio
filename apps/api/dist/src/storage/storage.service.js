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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const auth_service_1 = require("../auth/auth.service");
const config_1 = require("../config");
const errors_1 = require("../common/errors");
let StorageService = class StorageService {
    auth;
    client = new client_s3_1.S3Client({
        region: config_1.config.storage.region,
        endpoint: config_1.config.storage.endpoint,
        forcePathStyle: config_1.config.storage.forcePathStyle,
        credentials: {
            accessKeyId: config_1.config.storage.accessKeyId,
            secretAccessKey: config_1.config.storage.secretAccessKey,
        },
    });
    provider = config_1.config.storage.provider;
    bucket = config_1.config.storage.bucket;
    bucketReady = false;
    constructor(auth) {
        this.auth = auth;
    }
    async onApplicationBootstrap() {
        try {
            await this.ensureBucket();
            this.bucketReady = true;
        }
        catch (error) {
            console.warn(`MinIO no esta disponible en ${config_1.config.storage.endpoint}; se omitio la creacion automatica del bucket ${this.bucket}.`);
        }
    }
    async createUploadUrl(authorizationHeader, input) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const originalFilename = String(input.originalFilename || "").trim();
        const mimeType = String(input.mimeType || "application/octet-stream").trim();
        if (!originalFilename)
            (0, errors_1.badRequest)("El nombre del archivo es requerido");
        if (!this.bucketReady) {
            try {
                await this.ensureBucket();
                this.bucketReady = true;
            }
            catch (error) {
                (0, errors_1.badRequest)("Storage no esta disponible. Verifica que MinIO este corriendo.");
            }
        }
        const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
        const resourceId = input.resourceId ? String(input.resourceId) : node_crypto_1.default.randomUUID();
        const storageKey = input.scope === "profile-photo"
            ? `profiles/${user.id}/${resourceId}/${safeName}`
            : `resources/${user.id}/${resourceId}/${safeName}`;
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: storageKey,
            ContentType: mimeType,
        }), { expiresIn: 60 * 10 });
        return {
            provider: this.provider,
            bucket: this.bucket,
            storageKey,
            uploadUrl: url,
            expiresIn: 600,
            publicUrl: this.publicObjectUrl(storageKey),
        };
    }
    async createDownloadUrl(storageKey, originalFilename) {
        const dispositionName = originalFilename || storageKey.split("/").pop() || "recurso";
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: storageKey,
            ResponseContentDisposition: `attachment; filename="${dispositionName.replace(/"/g, "")}"`,
        }), { expiresIn: 60 * 5 });
    }
    async createReadUrl(storageKey) {
        if (!storageKey || storageKey.includes(".."))
            (0, errors_1.badRequest)("Objeto invalido");
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: storageKey,
            ResponseContentDisposition: "inline",
        }), { expiresIn: 60 * 5 });
    }
    publicObjectUrl(storageKey) {
        const endpoint = config_1.config.storage.publicEndpoint.replace(/\/+$/, "");
        return `${endpoint}/${this.bucket}/${storageKey}`;
    }
    async ensureBucket() {
        try {
            await this.client.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket }));
        }
        catch {
            await this.client.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucket }));
            try {
                await this.client.send(new client_s3_1.PutBucketPolicyCommand({
                    Bucket: this.bucket,
                    Policy: JSON.stringify({
                        Version: "2012-10-17",
                        Statement: [
                            {
                                Sid: "PublicRead",
                                Effect: "Allow",
                                Principal: "*",
                                Action: ["s3:GetObject"],
                                Resource: [`arn:aws:s3:::${this.bucket}/*`],
                            },
                        ],
                    }),
                }));
            }
            catch {
                /* MinIO might not support policies in all setups; ignore */
            }
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_service_1.AuthService)),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], StorageService);
