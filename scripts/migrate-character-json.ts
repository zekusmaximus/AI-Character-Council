const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting character JSON data migration...');

  let processedCharacters = 0;
  let migratedTraits = 0;
  let migratedAttributes = 0;

  try {
    const characters: Array<{ id: string; personalityTraits: string | null; characterSheet: string | null }> =
      await prisma.$queryRaw`SELECT id, "personalityTraits", "characterSheet" FROM "Character" WHERE "personalityTraits" IS NOT NULL OR "characterSheet" IS NOT NULL;`;

    if (characters.length === 0) {
      console.log('No characters with data in old JSON fields found for migration.');
      return;
    }

    console.log(`Found ${characters.length} characters to process.`);
    console.log('\n--- Starting Migration Process (individual creates) ---');

    for (const char of characters) {
      processedCharacters++;
      console.log(`Processing character ID: ${char.id}`);
      let charTraitsMigrated = 0;
      let charAttributesMigrated = 0;

      // Process personalityTraits
      if (char.personalityTraits && char.personalityTraits.trim() !== '') {
        try {
          const traits = JSON.parse(char.personalityTraits);
          if (Array.isArray(traits)) {
            for (const trait of traits) {
              if (trait.name && typeof trait.name === 'string' && trait.value && typeof trait.value === 'string') {
                try {
                  await prisma.personalityTrait.create({
                    data: {
                      characterId: char.id,
                      name: trait.name,
                      value: trait.value,
                    },
                  });
                  migratedTraits++;
                  charTraitsMigrated++;
                } catch (e: unknown) { // Explicitly type e
                  const errorAsAny = e as any; // Cast to any
                  if (errorAsAny instanceof Prisma.PrismaClientKnownRequestError && errorAsAny.code === 'P2002') {
                    console.log(`Trait '${trait.name}' for character ${char.id} already exists. Skipping.`);
                  } else if (errorAsAny.message) {
                    console.error(`Failed to create trait '${trait.name}' for char ${char.id}. Error: ${errorAsAny.message}`);
                  } else {
                    console.error(`Failed to create trait '${trait.name}' for char ${char.id}. Unknown error: ${String(errorAsAny)}`);
                  }
                }
              } else {
                console.warn(`Skipping invalid trait object for character ${char.id}: ${JSON.stringify(trait)}`);
              }
            }
          } else {
            console.error(`Parsed personalityTraits for character ${char.id} is not an array: ${char.personalityTraits}`);
          }
        } catch (e: unknown) { // Explicitly type e
          const errorAsAny = e as any; // Cast to any
          const errorDetails = errorAsAny.message ? errorAsAny.message : String(errorAsAny);
          const fullLogMessage = `Failed to parse personalityTraits for character ${char.id}. Error: ${errorDetails}. Data: ${char.personalityTraits}`;
          console.error(fullLogMessage);
        }
      }

      // Process characterSheet
      if (char.characterSheet && char.characterSheet.trim() !== '') {
        try {
          const attributes = JSON.parse(char.characterSheet);
          if (Array.isArray(attributes)) {
            for (const attr of attributes) {
              if (attr.name && typeof attr.name === 'string' && attr.value && typeof attr.value === 'string') {
                try {
                  await prisma.characterAttribute.create({
                    data: {
                      characterId: char.id,
                      name: attr.name,
                      value: attr.value,
                    },
                  });
                  migratedAttributes++;
                  charAttributesMigrated++;
                } catch (e: unknown) { // Explicitly type e
                  const errorAsAny = e as any; // Cast to any
                  if (errorAsAny instanceof Prisma.PrismaClientKnownRequestError && errorAsAny.code === 'P2002') {
                    console.log(`Attribute '${attr.name}' for character ${char.id} already exists. Skipping.`);
                  } else if (errorAsAny.message) {
                    console.error(`Failed to create attribute '${attr.name}' for char ${char.id}. Error: ${errorAsAny.message}`);
                  } else {
                    console.error(`Failed to create attribute '${attr.name}' for char ${char.id}. Unknown error: ${String(errorAsAny)}`);
                  }
                }
              } else {
                console.warn(`Skipping invalid attribute object for character ${char.id}: ${JSON.stringify(attr)}`);
              }
            }
          } else {
            console.error(`Parsed characterSheet for character ${char.id} is not an array: ${char.characterSheet}`);
          }
        } catch (e: unknown) { // Explicitly type e
          const errorAsAny = e as any; // Cast to any
          const errorDetails = errorAsAny.message ? errorAsAny.message : String(errorAsAny);
          const fullLogMessage = `Failed to parse characterSheet for character ${char.id}. Error: ${errorDetails}. Data: ${char.characterSheet}`;
          console.error(fullLogMessage);
        }
      }
      if(charTraitsMigrated > 0 || charAttributesMigrated > 0) {
        console.log(`For character ${char.id}: Migrated ${charTraitsMigrated} new traits and ${charAttributesMigrated} new attributes.`);
      } else {
        console.log(`For character ${char.id}: No new traits or attributes migrated (either no valid data, already exist, or parse error).`);
      }
    }

    console.log('\n--- Migration Process Summary ---');
    console.log(`Total characters checked: ${processedCharacters}`);
    console.log(`Total new personality traits created: ${migratedTraits}`);
    console.log(`Total new character attributes created: ${migratedAttributes}`);
    console.log('Character JSON data migration completed.');

  } catch (error: unknown) { // Explicitly type error
    const errorAsAny = error as any; // Cast to any
    const errorMessage = errorAsAny.message ? errorAsAny.message : String(errorAsAny);
    const stack = errorAsAny.stack;
    console.error('An error occurred during the migration process:', errorMessage);
    if (stack) {
        console.error(stack);
    }
  } finally {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  }
}

main()
  .then(() => {
    console.log('Migration script finished execution.');
  })
  .catch((e: unknown) => { // Explicitly type e
    const errorAsAny = e as any; // Cast to any
    const errorMessage = errorAsAny.message ? errorAsAny.message : String(errorAsAny);
    const stack = errorAsAny.stack;
    console.error('Unhandled error in migration script:', errorMessage);
    if (stack) {
        console.error(stack);
    }
    process.exit(1);
  });
