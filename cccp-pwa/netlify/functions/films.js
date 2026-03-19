const https = require('https');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzc9NHlulB6KpYEuE2FwFcwL9n_SR8h5DmAC_mPmJTqcacZjoCRXsKl09N26sba52fgqA/exec';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

exports.handler = async function(event, context) {
  try {
    const result = await httpsGet(GAS_URL);

    if (result.status !== 200) {
      return {
        statusCode: result.status,
        body: JSON.stringify({ error: 'Errore dal server Google', status: result.status })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      },
      body: result.body
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
