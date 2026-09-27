import { UserRepository } from '../repositories/user.repository.js';
import { SecurityUtil } from '../core/security.js';
import { UnauthorizedError, ConflictError, NotFoundError } from '../core/errors.js';
import { LoginInput, RegisterInput } from '../schemas/auth.schema.js';
import { Role } from '@prisma/client';
import { prisma } from '../core/prisma.js';

export class AuthService {
  static async login(input: LoginInput) {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) {
      // If demo admin login on first boot before seed
      if (
        input.email.toLowerCase() === 'sdma.officer@maharashtra.gov.in' &&
        input.password === 'Aeris@SDMA2026'
      ) {
        const defaultJurisdiction = await prisma.jurisdiction.findFirst({
          where: { code: 'mumbai_mmr' },
        });

        const hash = await SecurityUtil.hashPassword(input.password);
        const createdAdmin = await UserRepository.create({
          email: input.email,
          name: 'Maharashtra SDMA',
          subtitle: 'State Disaster Mgmt Authority',
          agencyName: 'State Disaster Management Authority, Government of Maharashtra',
          passwordHash: hash,
          role: Role.ADMIN,
          jurisdictionId: defaultJurisdiction?.id,
        });

        return this.generateAuthResponse(createdAdmin);
      }

      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await SecurityUtil.verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await UserRepository.updateLastLogin(user.id);
    return this.generateAuthResponse(user);
  }

  static async guestLogin() {
    let guestUser: any = await UserRepository.findByEmail('guest.observer@aeris.in');

    if (!guestUser) {
      const defaultJurisdiction = await prisma.jurisdiction.findFirst({
        where: { code: 'mumbai_mmr' },
      });

      const hash = await SecurityUtil.hashPassword('Guest@AerisPublic2026');
      guestUser = await UserRepository.create({
        email: 'guest.observer@aeris.in',
        name: 'Guest User',
        subtitle: 'Public Observer Access',
        agencyName: 'AERIS Public Portal',
        passwordHash: hash,
        role: Role.GUEST,
        jurisdictionId: defaultJurisdiction?.id,
      });
    }

    return this.generateAuthResponse(guestUser);
  }

  static async register(input: RegisterInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    let jurisdictionId: string | undefined;
    if (input.jurisdictionCode) {
      const j = await prisma.jurisdiction.findUnique({
        where: { code: input.jurisdictionCode },
      });
      jurisdictionId = j?.id;
    }

    const passwordHash = await SecurityUtil.hashPassword(input.password);
    const user = await UserRepository.create({
      email: input.email,
      name: input.name,
      subtitle: input.subtitle,
      agencyName: input.agencyName,
      passwordHash,
      role: input.role as Role,
      jurisdictionId,
    });

    return this.generateAuthResponse(user);
  }

  static async getCurrentUser(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      subtitle: user.subtitle,
      agencyName: user.agencyName,
      role: user.role,
      jurisdiction: user.jurisdiction
        ? {
            code: user.jurisdiction.code,
            name: user.jurisdiction.name,
            region: user.jurisdiction.region,
          }
        : null,
      lastLoginAt: user.lastLoginAt,
    };
  }

  private static generateAuthResponse(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      jurisdictionId: user.jurisdictionId,
    };

    const accessToken = SecurityUtil.generateAccessToken(payload);
    const refreshToken = SecurityUtil.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subtitle: user.subtitle,
        agencyName: user.agencyName,
        role: user.role,
        jurisdiction: user.jurisdiction
          ? {
              code: user.jurisdiction.code,
              name: user.jurisdiction.name,
              region: user.jurisdiction.region,
            }
          : null,
      },
    };
  }
}
