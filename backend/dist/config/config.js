import dotenv from 'dotenv';
dotenv.config();
const config = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'hotel_booking_dev',
        host: process.env.DB_HOST,
        dialect: 'mysql'
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'hotel_booking_test',
        host: process.env.DB_HOST,
        dialect: 'mysql'
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'hotel_booking',
        host: process.env.DB_HOST,
        dialect: 'mysql'
    }
};
export default config;
