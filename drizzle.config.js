/** @type { import("drizzle-kit").Config } */
export default {
  schema: './utils/Schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://AI_InterView_DB_owner:6MJ7oFcDIfhY@ep-plain-wave-a52a6qgx.us-east-2.aws.neon.tech/AI_InterView_DB?sslmode=require',
  },
}
