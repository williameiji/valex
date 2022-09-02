import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const { Pool } = pg;
const configDatabase: any = {
	connectionString: process.env.DATABASE_URL,
};

if (process.env.MODE === "PROD") {
	configDatabase.ssl = {
		rejectUnauthorized: false,
	};
}

const connection = new Pool(configDatabase);
export default connection;
