const https = require('https');
const fs = require('fs');
const path = require('path');

const targetUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/75/New_motorcycle_oil_filter_Hiflo_Filtro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original';
const dest = path.resolve(__dirname, '../public/images/products/oil-filter-tru4.jpg');

const file = fs.createWriteStream(dest);
https.get(targetUrl, {
  headers: {
    'User-Agent': 'AzabMotoBot/1.0 (admin@azabmoto.com)',
  }
}, (res) => {
  console.log('Status code:', res.statusCode);
  if (res.statusCode === 200) {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Successfully saved oil-filter-tru4.jpg, size:', fs.statSync(dest).size);
    });
  } else {
    console.error('Failed with status:', res.statusCode);
  }
}).on('error', console.error);
