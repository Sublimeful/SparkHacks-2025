import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "db",
  password: "sparkhacks",
});

await db.connect();

export async function select_one_row(sql, parameters = []) {
  try {
    const res = await db.query(sql, parameters);
    return res.rows[0];
  } catch (err) {
    console.error(err);
  }
}

export async function select_n_rows(sql, parameters = []) {
  try {
    const res = await db.query(sql, parameters);
    return res.rows;
  } catch (err) {
    console.error(err);
  }
}

export async function perform_action(sql, parameters = []) {
  try {
    const res = await db.query(sql, parameters);
    return res.rows.length;
  } catch (err) {
    console.error(err);
  }
}
