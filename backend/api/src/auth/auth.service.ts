import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException({ code: 'AUTH_FAILED', message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException({ code: 'AUTH_FAILED', message: 'Invalid credentials' });
    return user;
  }

  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);
      return this.issueTokens(user.id, user.email);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[AuthLoginError]', e);
      throw e;
    }
  }

  async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessSecret = (process.env.JWT_ACCESS_SECRET as string) || 'dev_access_secret_change';
    const refreshSecret = (process.env.JWT_REFRESH_SECRET as string) || 'dev_refresh_secret_change';
    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
  }
}


