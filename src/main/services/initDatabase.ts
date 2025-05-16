import { prisma } from './database';

export async function initDatabase() {
  try {
    // Test the database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Check if we need to create initial data
    const projectCount = await prisma.project.count();
    
    if (projectCount === 0) {
      console.log('Creating sample project...');
      
      // Create a sample project for first-time users
      const project = await prisma.project.create({
        data: {
          name: 'My First Project',
          description: 'A sample project to get started with AI Character Council',
        },
      });
      
      // Create a sample character
      await prisma.character.create({
        data: {
          projectId: project.id,
          name: 'Sample Character',
          bio: 'This is a sample character to demonstrate the system.',
          personalityTraits: JSON.stringify({
            core: {
              traits: [
                { name: 'Curious', value: 75 },
                { name: 'Intelligent', value: 80 }
              ],
              values: ['Truth', 'Learning']
            },
            voice: {
              speechPattern: 'Thoughtful and measured'
            }
          })
        }
      });
      
      console.log('Sample data created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}