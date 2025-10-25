import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.flashcard.deleteMany();
  await prisma.aiData.deleteMany();
  await prisma.material.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@test.com',
      password: hashedPassword
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@test.com',
      password: hashedPassword
    }
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@test.com',
      password: hashedPassword
    }
  });

  console.log(`✅ Created 3 users (password: password123)`);

  // Create courses
  console.log('📚 Creating courses...');
  const course1 = await prisma.course.create({
    data: {
      name: 'Biology 101',
      userId: user1.id
    }
  });

  const course2 = await prisma.course.create({
    data: {
      name: 'Computer Science 250',
      userId: user2.id
    }
  });

  const course3 = await prisma.course.create({
    data: {
      name: 'Biology 101',
      userId: user3.id
    }
  });

  console.log('✅ Created 3 courses');

  // Create materials with AI data
  console.log('📄 Creating materials with AI data...');
  
  // Alice's Biology material
  const material1 = await prisma.material.create({
    data: {
      filename: 'photosynthesis_notes.pdf',
      status: 'COMPLETED',
      courseId: course1.id,
      aiData: {
        create: {
          summary: 'This document covers photosynthesis, the process by which plants convert light energy into chemical energy. It discusses chloroplasts, chlorophyll, light-dependent reactions, and the Calvin cycle.',
          keywords: ['Photosynthesis', 'Chloroplast', 'Chlorophyll', 'Light Reactions', 'Calvin Cycle', 'C4 Plants', 'CAM Plants', 'ATP', 'NADPH']
        }
      },
      flashcards: {
        create: [
          {
            question: 'What is photosynthesis?',
            answer: 'The process by which plants convert light energy into chemical energy'
          },
          {
            question: 'Where does photosynthesis occur?',
            answer: 'In chloroplasts, specifically in the thylakoid membranes and stroma'
          }
        ]
      }
    }
  });

  // Bob's CS material
  const material2 = await prisma.material.create({
    data: {
      filename: 'algorithms_chapter1.pdf',
      status: 'COMPLETED',
      courseId: course2.id,
      aiData: {
        create: {
          summary: 'Introduction to algorithms and data structures. Covers Big O notation, sorting algorithms including quicksort and mergesort, and basic data structures like arrays and linked lists.',
          keywords: ['Algorithms', 'Data Structures', 'Big O Notation', 'Sorting', 'Quicksort', 'Mergesort', 'Arrays', 'Linked Lists', 'Complexity Analysis']
        }
      },
      flashcards: {
        create: [
          {
            question: 'What is Big O notation?',
            answer: 'A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity'
          },
          {
            question: 'What is the time complexity of quicksort?',
            answer: 'O(n log n) on average, O(n²) worst case'
          }
        ]
      }
    }
  });

  // Charlie's Biology material (overlapping keywords with Alice)
  const material3 = await prisma.material.create({
    data: {
      filename: 'cellular_respiration.pdf',
      status: 'COMPLETED',
      courseId: course3.id,
      aiData: {
        create: {
          summary: 'This document explains cellular respiration, focusing on how cells break down glucose to produce ATP. Covers glycolysis, Krebs cycle, electron transport chain, and the relationship to photosynthesis.',
          keywords: ['Cellular Respiration', 'ATP', 'Glycolysis', 'Krebs Cycle', 'Electron Transport Chain', 'Mitochondria', 'Photosynthesis', 'Glucose', 'NADH']
        }
      },
      flashcards: {
        create: [
          {
            question: 'What is cellular respiration?',
            answer: 'The process by which cells break down glucose to produce ATP energy'
          },
          {
            question: 'Where does the Krebs cycle occur?',
            answer: 'In the mitochondrial matrix'
          }
        ]
      }
    }
  });

  console.log('✅ Created 3 materials with AI data and flashcards');

  // Create study groups
  console.log('👥 Creating study groups...');
  
  const group1 = await prisma.group.create({
    data: {
      name: 'Biology Study Group',
      description: 'For students studying photosynthesis, cellular respiration, and related topics',
      members: {
        create: [
          { userId: user3.id }  // Charlie is a member
        ]
      }
    }
  });

  const group2 = await prisma.group.create({
    data: {
      name: 'Computer Science Algorithms',
      description: 'Discussing algorithms, data structures, and complexity analysis',
      members: {
        create: [
          { userId: user2.id }  // Bob is a member
        ]
      }
    }
  });

  const group3 = await prisma.group.create({
    data: {
      name: 'Advanced Biology Topics',
      description: 'Deep dive into plant biology and biochemistry',
      members: {
        create: [
          { userId: user2.id },  // Bob
          { userId: user3.id }   // Charlie
        ]
      }
    }
  });

  console.log('✅ Created 3 study groups');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Test Data Summary:');
  console.log('════════════════════════════════════════');
  console.log('Users:');
  console.log('  • alice@test.com (password123) - Biology student with Photosynthesis material');
  console.log('  • bob@test.com (password123) - CS student with Algorithms material');
  console.log('  • charlie@test.com (password123) - Biology student with Cellular Respiration material');
  console.log('\nGroups:');
  console.log('  • Biology Study Group (Charlie)');
  console.log('  • Computer Science Algorithms (Bob)');
  console.log('  • Advanced Biology Topics (Bob, Charlie)');
  console.log('\nKeyword Overlaps:');
  console.log('  • Alice & Charlie share: Photosynthesis, ATP, NADPH');
  console.log('  • Alice should see recommendations for Biology groups!');
  console.log('════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
