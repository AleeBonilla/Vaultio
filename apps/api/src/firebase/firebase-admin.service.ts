import fs from "node:fs";
import { Injectable } from "@nestjs/common";
import { cert, getApps, initializeApp, ServiceAccount } from "firebase-admin/app";
import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import { config } from "../config";
import { unauthorized } from "../common/errors";

@Injectable()
export class FirebaseAdminService {
  constructor() {
    this.initialize();
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await getAuth().verifyIdToken(idToken);
    } catch {
      unauthorized("Token de Firebase inválido");
    }
  }

  private initialize() {
    if (getApps().length) return;

    const serviceAccountPath = config.auth.firebaseServiceAccountPath;
    if (!fs.existsSync(serviceAccountPath)) {
      unauthorized("Credenciales de Firebase Admin no configuradas");
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")) as ServiceAccount;
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
}
