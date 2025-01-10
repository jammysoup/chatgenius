import { prisma } from "@/lib/prisma";

async function main() {
  try {
    // Test the connection
    const users = await prisma.user.findMany();
    console.log('Database connection successful!');
    console.log('Users in database:', users);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 