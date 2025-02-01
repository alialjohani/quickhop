// src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger';
dotenv.config();

const db_name = process.env.DB_NAME || "";
const username = process.env.DB_USER || "";
const endpoint = process.env.DB_ENDPOINT || "";
const password = process.env.environment === 'PROD'
  ? process.env._PASSWORD
  : process.env.DB_PASSWORD || "";

const sequelize = new Sequelize(db_name, username, password, {
  host: endpoint,
  port: 5432,
  // maxConcurrentQueries: 100,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This can be true if the SSL certificate is trusted
    },
  },
  pool: { max: 5, idle: 30 },
  //language: 'en',
});

logger.info("sequelize initialized.");
export default sequelize;