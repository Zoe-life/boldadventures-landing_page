require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Tour = require('./server/models/Tour');
const connectDB = require('./server/config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Tour.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@boldadventures.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
    });

    // Create guide user
    console.log('Creating guide user...');
    const guide = await User.create({
      name: 'Tour Guide',
      email: 'guide@boldadventures.com',
      password: 'Guide123!',
      role: 'guide',
      isEmailVerified: true,
    });

    // Create regular user
    console.log('Creating regular user...');
    await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'User123!',
      role: 'user',
      isEmailVerified: true,
    });

    // Create tours
    console.log('Creating tours...');
    const tours = [
      {
        title: 'Tibet Adventure',
        description: 'Tibet, the Roof of the World, offers a truly unique and transformative experience. The tour ventured into this mystical land, exploring its ancient monasteries, breathtaking landscapes, and rich cultural heritage.',
        location: {
          country: 'China',
          city: 'Lhasa',
        },
        duration: 6,
        price: 340000,
        currency: 'KSH',
        maxGroupSize: 12,
        difficulty: 'difficult',
        category: 'hiking',
        coverImage: './images/tour-1.jpeg',
        images: ['./images/tour-1.jpeg'],
        featured: true,
        rating: 4.8,
        ratingsQuantity: 23,
        startDates: [new Date('2026-08-26'), new Date('2026-09-15')],
        createdBy: guide._id,
      },
      {
        title: 'Best of Java',
        description: 'Java, the most populous island in the world, offers a captivating blend of ancient culture, stunning landscapes, and vibrant cities. The tour delved into the heart of Indonesia.',
        location: {
          country: 'Indonesia',
          city: 'Jakarta',
        },
        duration: 11,
        price: 200000,
        currency: 'KSH',
        maxGroupSize: 15,
        difficulty: 'moderate',
        category: 'adventure-package',
        coverImage: './images/tour-2.jpeg',
        images: ['./images/tour-2.jpeg'],
        featured: true,
        rating: 4.6,
        ratingsQuantity: 18,
        startDates: [new Date('2026-10-01'), new Date('2026-11-10')],
        createdBy: guide._id,
      },
      {
        title: 'Explore Hong Kong',
        description: 'The tour ventured into the heart of Hong Kong, a vibrant metropolis that seamlessly blends towering skyscrapers with lush greenery.',
        location: {
          country: 'Hong Kong',
          city: 'Hong Kong',
        },
        duration: 8,
        price: 300000,
        currency: 'KSH',
        maxGroupSize: 10,
        difficulty: 'easy',
        category: 'biking',
        coverImage: './images/tour-3.jpeg',
        images: ['./images/tour-3.jpeg'],
        featured: true,
        rating: 4.7,
        ratingsQuantity: 31,
        startDates: [new Date('2026-09-15'), new Date('2026-10-20')],
        createdBy: guide._id,
      },
      {
        title: 'Kenya Highlights',
        description: 'Kenya, a land of contrasts, offers an unforgettable journey for those seeking to immerse themselves in the wonders of the African continent.',
        location: {
          country: 'Kenya',
          city: 'Nairobi',
        },
        duration: 20,
        price: 100000,
        currency: 'KSH',
        maxGroupSize: 20,
        difficulty: 'moderate',
        category: 'adventure-package',
        coverImage: './images/tour-4.jpeg',
        images: ['./images/tour-4.jpeg'],
        featured: true,
        rating: 4.9,
        ratingsQuantity: 42,
        startDates: [new Date('2026-12-05'), new Date('2027-01-15')],
        createdBy: guide._id,
      },
    ];

    await Tour.insertMany(tours);

    console.log('Seed data created successfully!');
    console.log('\nTest Users:');
    console.log('Admin: admin@boldadventures.com / Admin123!');
    console.log('Guide: guide@boldadventures.com / Guide123!');
    console.log('User: user@example.com / User123!');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
