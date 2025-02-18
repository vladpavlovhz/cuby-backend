import pg from 'pg';
import dotenv from 'dotenv';
import scrapeEvents from '../scraper.js';

const { Pool } = pg;

dotenv.config()

const createPool = () => new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});


const pool = createPool();

// Function to create the "events" table in the database
const createEventsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      datetime TIMESTAMP NOT NULL,
      location VARCHAR(255) NOT NULL,
      image VARCHAR(255),
      description TEXT,
      link VARCHAR(255)
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Events table created successfully');
  } catch (error) {
    console.error('Error creating events table:', error);
  }
};

// Function to seed the database with scraped events
const seedDatabase = async () => {
  try {
    // Create events table if not exists
    await createEventsTable();

    // Scrape events
    const scrapedEvents = await scrapeEvents();

    // Insert scraped events into the database
    for (const event of scrapedEvents) {
      // Check if the event already exists in the database based on name and datetime
      const checkExistenceQuery = {
        text: 'SELECT * FROM events WHERE name = $1 AND datetime = $2',
        values: [event.eventTitleScraped, event.eventDateScraped],
      };

      const existingEventResult = await pool.query(checkExistenceQuery);

      if (existingEventResult.rows.length === 0) {
        // Event does not exist, insert it into the database
        const insertQuery = {
          text: 'INSERT INTO events (name, datetime, location, description, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          values: [
            event.eventTitleScraped,
            event.eventDateScraped,
            event.eventPlaceScraped,
            event.eventDescription,
            event.eventImage,
          ],
        };

        try {
          const result = await pool.query(insertQuery);
          const insertedEvent = result.rows[0];
        } catch (err) {
          console.error('Error inserting event into the database:', err);
        }
      } else {
        // Event already exists, skip insertion
        console.log(`Event already exists in the database: ${event.eventTitleScraped}`);
      }
    }

    console.log('Database seeded successfully with scraped events');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Call the seedDatabase function to create and seed the database
seedDatabase();

export default pool;
