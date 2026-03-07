import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  generateRandomToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateResetToken() {
    const rawToken = this.generateRandomToken();
    const tokenHash = this.hashToken(rawToken);

    return {
      rawToken,
      tokenHash,
    };
  }
}
