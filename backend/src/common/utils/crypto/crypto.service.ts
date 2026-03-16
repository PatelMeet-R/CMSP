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
  generateRandomPassword(length = 10): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    let password = '';
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += charset[bytes[i] % charset.length];
    }

    return password;
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
