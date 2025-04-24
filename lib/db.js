"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var node_postgres_1 = require("drizzle-orm/node-postgres");
var pg_1 = require("pg");
var Pool = pg_1.default.Pool;
var schema = require("@shared/schema");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
exports.db = (0, node_postgres_1.drizzle)(pool, { schema: schema });
