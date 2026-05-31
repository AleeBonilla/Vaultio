import crypto from "node:crypto";
import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AuthService } from "../auth/auth.service";
import { config } from "../config";
import { badRequest } from "../common/errors";

@Injectable()
export class StorageService implements OnApplicationBootstrap {
  private readonly client = new S3Client({
    region: config.storage.region,
    endpoint: config.storage.endpoint,
    forcePathStyle: config.storage.forcePathStyle,
    credentials: {
      accessKeyId: config.storage.accessKeyId,
      secretAccessKey: config.storage.secretAccessKey,
    },
  });

  readonly provider = config.storage.provider;
  readonly bucket = config.storage.bucket;
  private readonly autoCreateBucket = config.storage.autoCreateBucket;
  private bucketReady = false;

  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  async onApplicationBootstrap() {
    try {
      await this.ensureBucket();
      this.bucketReady = true;
    } catch (error) {
      console.warn(
        `Storage ${this.provider} no esta disponible en ${config.storage.endpoint}; no se pudo verificar el bucket ${this.bucket}.`,
      );
    }
  }

  async createUploadUrl(authorizationHeader: string | undefined, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const originalFilename = String(input.originalFilename || "").trim();
    const mimeType = String(input.mimeType || "application/octet-stream").trim();

    if (!originalFilename) badRequest("El nombre del archivo es requerido");

    if (!this.bucketReady) {
      try {
        await this.ensureBucket();
        this.bucketReady = true;
      } catch (error) {
        badRequest("Storage no esta disponible. Verifica la configuracion del bucket y credenciales.");
      }
    }

    const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const resourceId = input.resourceId ? String(input.resourceId) : crypto.randomUUID();
    const storageKey =
      input.scope === "profile-photo"
        ? `profiles/${user.id}/${resourceId}/${safeName}`
        : `resources/${user.id}/${resourceId}/${safeName}`;

    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        ContentType: mimeType,
      }),
      { expiresIn: 60 * 10 },
    );

    return {
      provider: this.provider,
      bucket: this.bucket,
      storageKey,
      uploadUrl: url,
      expiresIn: 600,
      publicUrl: this.publicObjectUrl(storageKey),
    };
  }

  async createDownloadUrl(storageKey: string, originalFilename?: string) {
    const dispositionName = originalFilename || storageKey.split("/").pop() || "recurso";
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        ResponseContentDisposition: `attachment; filename="${dispositionName.replace(/"/g, "")}"`,
      }),
      { expiresIn: 60 * 5 },
    );
  }

  async createReadUrl(storageKey: string) {
    if (!storageKey || storageKey.includes("..")) badRequest("Objeto inválido");
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
        ResponseContentDisposition: "inline",
      }),
      { expiresIn: 60 * 5 },
    );
  }

  publicObjectUrl(storageKey: string) {
    const endpoint = config.storage.publicEndpoint.replace(/\/+$/, "");
    const encodedKey = storageKey
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    return config.storage.publicIncludeBucket
      ? `${endpoint}/${this.bucket}/${encodedKey}`
      : `${endpoint}/${encodedKey}`;
  }

  private async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      if (!this.autoCreateBucket) {
        throw new Error(`Bucket ${this.bucket} no disponible o sin permisos para HeadBucket`);
      }
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      try {
        await this.client.send(
          new PutBucketPolicyCommand({
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
          }),
        );
      } catch {
        /* MinIO might not support policies in all setups; ignore */
      }
    }
  }
}
