import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "db",
  password: "sparkhacks",
});

export default pool;
