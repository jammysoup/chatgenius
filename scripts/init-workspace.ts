import { prisma } from "@/lib/prisma";

async function main() {
  const defaultChannels = ['general', 'random', 'introductions'];
  
  console.log('Initializing workspace with default channels...');
  
  // Create default channels if they don't exist
  for (const channelName of defaultChannels) {
    const existingChannel = await prisma.channel.findUnique({
      where: { name: channelName }
    });

    if (!existingChannel) {
      await prisma.channel.create({
        data: {
          name: channelName,
          description: `Default ${channelName} channel`,
          isPrivate: false,
          // First admin user will be set as owner
          ownerId: "system"
        }
      });
      console.log(`Created ${channelName} channel`);
    } else {
      console.log(`${channelName} channel already exists`);
    }
  }

  console.log('Workspace initialization complete!');
}

main()
  .catch((e) => {
    console.error('Error initializing workspace:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 