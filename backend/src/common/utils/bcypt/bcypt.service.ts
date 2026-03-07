import { Injectable } from '@nestjs/common';

import { compare, genSalt, hash } from 'bcrypt';
@Injectable()
export class BcyptService {
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    const hashPass = await hash(password, salt);
    return hashPass;
  }
  async isPasswordValid(dbPass, userPass): Promise<boolean> {
    const result = await compare(dbPass, userPass);
    return result;
  }
}
