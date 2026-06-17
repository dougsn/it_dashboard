import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const devices = await prisma.device.findMany({
        where: { ip: "192.168.0.251" }
    });
    console.log(devices);
}

main().finally(() => prisma.$disconnect());
