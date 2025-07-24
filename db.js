const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function conectar() {
  try {
    if (!sql.pool) {
      await sql.connect(dbConfig);
    }
  } catch (err) {
    console.error('Erro na conexão:', err);
    throw err;
  }
}

async function buscarNovasSaidas(numeroRef) {
  await conectar();

  const result = await sql.query`
    SELECT * FROM vw_app_nfemitidas
    WHERE Numero_Nota > ${numeroRef}
    ORDER BY Numero_Nota DESC
  `;

  return result.recordset;
}

module.exports = {
  buscarNovasSaidas
};

