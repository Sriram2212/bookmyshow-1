const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookmyshow');
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await Show.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create sample movies
    const movies = await Movie.insertMany([
      {
        title: 'The Dark Knight',
        description: 'Batman faces the Joker in this epic superhero film.',
        genre: ['Action', 'Crime', 'Drama'],
        duration: 152,
        releaseDate: new Date('2024-01-15'),
        rating: 9.0,
        language: 'English'
      },
      {
        title: 'Inception',
        description: 'A mind-bending thriller about dream infiltration.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        duration: 148,
        releaseDate: new Date('2024-02-01'),
        rating: 8.8,
        language: 'English'
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space.',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        duration: 169,
        releaseDate: new Date('2024-02-15'),
        rating: 8.6,
        language: 'English'
      },
      {
        title: 'The Matrix',
        description: 'A computer hacker learns about the true nature of reality.',
        genre: ['Action', 'Sci-Fi'],
        duration: 136,
        releaseDate: new Date('2024-03-01'),
        rating: 8.7,
        language: 'English'
      }
    ]);

    console.log('✅ Created movies');

    // Create sample theaters
    const theaters = await Theater.insertMany([
      {
        name: 'CineMax Downtown',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        totalScreens: 5,
        amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats']
      },
      {
        name: 'Grand Cinema',
        address: {
          street: '456 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10002'
        },
        totalScreens: 4,
        amenities: ['3D', 'Premium Sound']
      },
      {
        name: 'Star Theater',
        address: {
          street: '789 Park Avenue',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        },
        totalScreens: 3,
        amenities: ['Luxury Seating']
      }
    ]);

    console.log('✅ Created theaters');

    // Create sample shows
    const shows = [];
    const today = new Date();
    const basePrice = 12.99;

    movies.forEach((movie, movieIdx) => {
      theaters.forEach((theater, theaterIdx) => {
        // Create shows for next 7 days
        for (let day = 0; day < 7; day++) {
          const showDate = new Date(today);
          showDate.setDate(today.getDate() + day);
          showDate.setHours(0, 0, 0, 0);

          // Create 3 shows per day (morning, afternoon, evening)
          const showTimes = [
            { hour: 10, minute: 30 },
            { hour: 14, minute: 0 },
            { hour: 18, minute: 30 }
          ];

          showTimes.forEach((time, timeIdx) => {
            const showTime = new Date(showDate);
            showTime.setHours(time.hour, time.minute, 0, 0);

            // Create seats (5 rows x 10 columns)
            const rows = ['A', 'B', 'C', 'D', 'E'];
            const seats = [];
            rows.forEach((row, rowIdx) => {
              for (let col = 1; col <= 10; col++) {
                const seatType = rowIdx < 2 ? 'premium' : 'regular';
                seats.push({
                  seatNumber: `${row}${col}`,
                  row: row,
                  column: col,
                  seatType: seatType,
                  price: seatType === 'premium' ? basePrice * 1.5 : basePrice,
                  status: 'available'
                });
              }
            });

            shows.push({
              movie: movie._id,
              theater: theater._id,
              screen: `Screen ${(theaterIdx % theater.totalScreens) + 1}`,
              showTime: showTime,
              showDate: showDate,
              totalSeats: 50,
              seats: seats,
              basePrice: basePrice,
              isActive: true
            });
          });
        }
      });
    });

    await Show.insertMany(shows);
    console.log(`✅ Created ${shows.length} shows`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nSample data:');
    console.log(`- ${movies.length} movies`);
    console.log(`- ${theaters.length} theaters`);
    console.log(`- ${shows.length} shows`);
    console.log('\nYou can now start the server and test the application.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => {
  seedData();
});

