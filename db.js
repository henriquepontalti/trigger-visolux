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
    SELECT * FROM tbSaidas
    WHERE Num_docto > ${numeroRef} AND Cod_docto = 'NE'
    ORDER BY Num_docto DESC
  `;

  return result.recordset;
}

module.exports = {
  buscarNovasSaidas
};

