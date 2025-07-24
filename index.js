const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const { buscarNovasSaidas } = require('./db');

const caminhoJson = path.join(__dirname, 'ultima-data.json');
const webhookUrl = process.env.WEBHOOK_URL;
const intervalo = parseInt(process.env.INTERVALO_MS || '30000');

function lerUltimaData() {
  try {
    const data = fs.readFileSync(caminhoJson, 'utf8');
    return new Date(JSON.parse(data).ultimaData);
  } catch (e) {
    return new Date(process.env.DATA_INICIAL);
  }
}

function salvarUltimaData(data) {
  fs.writeFileSync(caminhoJson, JSON.stringify({ ultimaData: data }));
}

async function verificar() {
  const ultimaData = lerUltimaData();

  try {
    const novas = await buscarNovasSaidas(ultimaData);

    if (novas.length > 0) {
      console.log(`🟢 ${novas.length} novas TbSaidas Registradas`);
      console.log(`🟢 ${novas.length} novas TbSaidas`);

      for (const saida of novas) {
        await axios.post(webhookUrl, saida);
        console.log('✅ Webhook enviado para:', saida);
      }

      const maisRecente = novas.reduce((max, s) => 
        new Date(s.Data_movto) > new Date(max.Data_movto) ? s : max
      );
      salvarUltimaData(maisRecente.Data_movto);
    } else {
      console.log('🔍 Nenhuma nova saída encontrada');
    }
  } catch (err) {
    console.error('❌ Erro ao verificar saídas:', err.message);
  }
}

setInterval(verificar, intervalo);
console.log('⏳ Iniciando monitoramento...');
verificar();
