/**
 * Мок для Prisma Client для использования в тестах
 */

export const createMockPrisma = () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    note: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  return mockPrisma;
};

export type MockPrisma = ReturnType<typeof createMockPrisma>;

