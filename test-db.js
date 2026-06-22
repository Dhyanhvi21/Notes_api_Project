const pool = require("./db");

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database Connected Successfully");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await pool.end();
  }
}

test();