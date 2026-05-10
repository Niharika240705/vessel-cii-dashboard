const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://admin:adminpassword@127.0.0.1:5433/cii_dashboard?schema=public' });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows[0]);
  pool.end();
});
