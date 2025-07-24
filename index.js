const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { buscarNovasSaidas } = require('./db');

const caminhoJson = path.join(__dirname, 'ultimo-numero.json');
const webhookUrl = process.env.WEBHOOK_URL;
const intervalo = parseInt(process.env.INTERVALO_MS || '30000');

function lerUltimoNumero() {
  try {
    const data = fs.readFileSync(caminhoJson, 'utf8');
    return parseInt(JSON.parse(data).ultimoNumero, 10);
  } catch (e) {
    return parseInt(process.env.NUM_INICIAL, 10);
  }
}

function salvarUltimoNumero(numero) {
  fs.writeFileSync(caminhoJson, JSON.stringify({ ultimoNumero: numero }));
}

async function verificar() {
  const ultimoNumero = lerUltimoNumero();

  try {
    const novas = await buscarNovasSaidas(ultimoNumero);

    if (novas.length > 0) {
      console.log(`🟢 ${novas.length} novas TbSaidas Registradas`);
      console.log(`🟢 Executando Loop de Saídas para enviar para o Webhook...`);
      for (const saida of novas) {
        try {
          const payload = JSON.parse(JSON.stringify(saida, (_, v) =>
              typeof v === 'bigint' ? v.toString() : v
          ));

          console.log('🔍 Enviando payload via fetch:', payload);

          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error(`Status ${res.status}`);
          console.log('✅ Webhook enviado com POST via fetch');
        } catch (err) {
          console.error('❌ Erro no fetch:', err.message);
        }
      }
      const maisRecente = novas.reduce((max, s) =>
        s.Numero_Nota > max.Numero_Nota ? s : max
      );
      salvarUltimoNumero(maisRecente.Numero_Nota);
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
