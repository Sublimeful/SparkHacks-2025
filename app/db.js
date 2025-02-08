import pg from "pg";

const pool = new pg.Pool({
  user: "postgres",
  host: "db",
  password: "sparkhacks",
});

export async function select_one_row(sql, parameters = []) {
  try {
    const res = await pool.query(sql, parameters);
    return res.rows[0];
  } catch (err) {
    console.error("Error in select_one_row:", err);
    throw err; // rethrow so the caller knows an error occurred
  }
}

export async function select_n_rows(sql, parameters = []) {
  try {
    const res = await pool.query(sql, parameters);
    return res.rows;
  } catch (err) {
    console.error("Error in select_n_rows:", err);
    throw err;
  }
}

export async function perform_action(sql, parameters = []) {
  try {
    const res = await pool.query(sql, parameters);
    return res.rowCount;
  } catch (err) {
    console.error("Error in perform_action:", err);
    throw err;
  }
}
