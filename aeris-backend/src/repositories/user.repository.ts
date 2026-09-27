import { prisma } from '../core/prisma.js';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const MOCK_ADMIN_HASH = bcrypt.hashSync('Aeris@SDMA2026', 10);
const MOCK_GUEST_HASH = bcrypt.hashSync('Guest@AerisPublic2026', 10);

const IN_MEMORY_USERS: any[] = [
  {
    id: 'user-admin-001',
    email: 'sdma.officer@maharashtra.gov.in',
    name: 'Maharashtra SDMA',
    subtitle: 'State Disaster Mgmt Authority',
    agencyName: 'State Disaster Management Authority, Government of Maharashtra',
    passwordHash: MOCK_ADMIN_HASH,
    role: Role.ADMIN,
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'user-guest-001',
    email: 'guest.observer@aeris.in',
    name: 'Guest User',
    subtitle: 'Public Observer Access',
    agencyName: 'AERIS Public Portal',
    passwordHash: MOCK_GUEST_HASH,
    role: Role.GUEST,
    jurisdictionId: 'jur-mumbai-001',
    jurisdiction: {
      id: 'jur-mumbai-001',
      code: 'mumbai_mmr',
      name: 'Mumbai MMR',
      region: 'Konkan Basin',
    },
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class UserRepository {
  static async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: { jurisdiction: true },
      });
    } catch (e) {
      return IN_MEMORY_USERS.find((u) => u.id === id) || null;
    }
  }

  static async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { jurisdiction: true },
      });
    } catch (e) {
      return (
        IN_MEMORY_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
      );
    }
  }

  static async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    subtitle?: string;
    agencyName?: string;
    role?: Role;
    jurisdictionId?: string;
  }) {
    try {
      return await prisma.user.create({
        data: {
          ...data,
          email: data.email.toLowerCase(),
        },
        include: { jurisdiction: true },
      });
    } catch (e) {
      const newUser = {
        id: `user-${Date.now()}`,
        email: data.email.toLowerCase(),
        name: data.name,
        subtitle: data.subtitle || '',
        agencyName: data.agencyName || '',
        passwordHash: data.passwordHash,
        role: data.role || Role.GUEST,
        jurisdictionId: data.jurisdictionId || 'jur-mumbai-001',
        jurisdiction: {
          id: 'jur-mumbai-001',
          code: 'mumbai_mmr',
          name: 'Mumbai MMR',
          region: 'Konkan Basin',
        },
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      IN_MEMORY_USERS.push(newUser);
      return newUser as any;
    }
  }

  static async updateLastLogin(id: string) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
    } catch (e) {
      const user = IN_MEMORY_USERS.find((u) => u.id === id);
      if (user) user.lastLoginAt = new Date();
      return user;
    }
  }
}
