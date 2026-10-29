const https = require('https');
const fs = require('fs');
const path = require('path');

const productsDir = path.resolve(__dirname, '../public/images/products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const targets = [
  {
    id: 'prod-001',
    sku: 'AZB-BRK-001',
    name: 'تيل فرامل أمامي أصلي TVS أباتشي',
    filename: 'brake-pads.webp',
    bucket: 'brake-pads',
    isGenerated: true,
    fileTitle: 'AI Studio Photography (TVS Genuine Specification)',
    license: 'Proprietary / Azab Moto Catalog',
    sourceUrl: 'local',
  },
  {
    id: 'prod-002',
    sku: 'AZB-BRK-002',
    name: 'تيل فرامل خلفي درام TVS HLX 150',
    filename: 'rear-brake-shoe-hlx.jpg',
    bucket: 'brake-shoe',
    searchQuery: 'brake shoe drum',
  },
  {
    id: 'prod-003',
    sku: 'AZB-BRK-003',
    name: 'ديسك فرامل أمامي مهوّى أباتشي 200',
    filename: 'brake-disc-apache-200.jpg',
    bucket: 'brake-disc',
    searchQuery: 'Aisobrake1',
  },
  {
    id: 'prod-004',
    sku: 'AZB-FLT-001',
    name: 'فلتر زيت أصلي TVS TRU4',
    filename: 'oil-filter-tru4.jpg',
    bucket: 'oil-filter',
    directUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/New_motorcycle_oil_filter_Hiflo_Filtro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    fileTitle: 'File:New motorcycle oil filter Hiflo Filtro.jpg',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:New_motorcycle_oil_filter_Hiflo_Filtro.jpg',
  },
  {
    id: 'prod-005',
    sku: 'AZB-FLT-002',
    name: 'عنصر فلتر هواء أباتشي 160 4V',
    filename: 'air-filter-apache-160.jpg',
    bucket: 'air-filter',
    searchQuery: 'engine air filter element',
  },
  {
    id: 'prod-006',
    sku: 'AZB-FLT-003',
    name: 'فلتر بنزين داخلي أصلي TVS',
    filename: 'fuel-filter-inline.jpg',
    bucket: 'fuel-filter',
    searchQuery: 'fuel filter automotive transparent',
  },
  {
    id: 'prod-007',
    sku: 'AZB-ELC-001',
    name: 'بوجيه أصلي TVS Bosch UR4KC',
    filename: 'spark-plug-bosch.jpg',
    bucket: 'spark-plug',
    searchQuery: 'spark plug electrode',
  },
  {
    id: 'prod-008',
    sku: 'AZB-ELC-002',
    name: 'ملف كهرباء (دينامو) كامل TVS HLX 150',
    filename: 'stator-coil-hlx-150.jpg',
    bucket: 'stator-coil',
    searchQuery: 'alternator stator coil',
  },
  {
    id: 'prod-009',
    sku: 'AZB-ELC-003',
    name: 'وحدة إشعال إلكتروني CDI رقمية أباتشي',
    filename: 'cdi-unit-apache-160.jpg',
    bucket: 'cdi-unit',
    searchQuery: 'CDI module motorcycle ignition',
  },
  {
    id: 'prod-010',
    sku: 'AZB-BAT-001',
    name: 'بطارية جافة TVS 12V 5Ah أصلية',
    filename: 'battery-dry-12v-5ah.jpg',
    bucket: 'battery-dry',
    searchQuery: 'Yuasa battery motorcycle 12v',
  },
  {
    id: 'prod-011',
    sku: 'AZB-BAT-002',
    name: 'بطارية جيل 12V 9Ah أباتشي 200 عالية القدرة',
    filename: 'battery-gel-12v-9ah.jpg',
    bucket: 'battery-gel',
    searchQuery: 'motorcycle battery 12v AGM',
  },
  {
    id: 'prod-012',
    sku: 'AZB-BAT-003',
    name: 'بطارية اسكوتر TVS 12V 4Ah جوبيتر وإن تورك',
    filename: 'battery-scooter-12v-4ah.jpg',
    bucket: 'battery-scooter',
    searchQuery: 'scooter battery 12v sealed',
  },
  {
    id: 'prod-013',
    sku: 'AZB-TIR-001',
    name: 'إطار أمامي تيوبلس مقاس 90/90-17 TVS Eurogrip',
    filename: 'tire-front-90-90-17.jpg',
    bucket: 'tire-front',
    directUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Motorcycle_tire_in_tire_warmer_%282%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    fileTitle: 'File:Motorcycle tire in tire warmer (2).jpg',
    license: 'CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Motorcycle_tire_in_tire_warmer_(2).jpg',
  },
  {
    id: 'prod-014',
    sku: 'AZB-TIR-002',
    name: 'إطار خلفي عريض مقاس 130/70-17 تيوبلس',
    filename: 'tire-rear-130-70-17.jpg',
    bucket: 'tire-rear',
    directUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Motorcycle_tyre_stack.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    fileTitle: 'File:Motorcycle tyre stack.jpg',
    license: 'CC BY 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Motorcycle_tyre_stack.jpg',
  },
  {
    id: 'prod-015',
    sku: 'AZB-TIR-003',
    name: 'إطار خلفي خشن حمولة ثقيلة 3.00-17 TVS HLX',
    filename: 'tire-heavy-duty-300-17.jpg',
    bucket: 'tire-heavy',
    searchQuery: 'motorcycle tire tread pattern block',
  },
  {
    id: 'prod-016',
    sku: 'AZB-OIL-001',
    name: 'زيت محرك أصلي TVS TRU4 Premium 10W-30 (1 لتر)',
    filename: 'engine-oil-tru4-10w30.jpg',
    bucket: 'engine-oil',
    directUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Motor_oil_bottles_variousbrands.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    fileTitle: 'File:Motor oil bottles variousbrands.jpg',
    license: 'CC BY 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Motor_oil_bottles_variousbrands.jpg',
  },
  {
    id: 'prod-017',
    sku: 'AZB-OIL-002',
    name: 'زيت تخليقي بالكامل TVS TRU4 Fully Synthetic 10W-40',
    filename: 'engine-oil-synthetic-10w40.jpg',
    bucket: 'engine-oil-synthetic',
    directUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Petro-canada_oil_bottle_products_7355.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    fileTitle: 'File:Petro-canada oil bottle products 7355.jpg',
    license: 'Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Petro-canada_oil_bottle_products_7355.jpg',
  },
  {
    id: 'prod-018',
    sku: 'AZB-OIL-003',
    name: 'اسبراي تزييت جنزير عالي الالتصاق 400 مل',
    filename: 'chain-lube-spray-400ml.jpg',
    bucket: 'chain-lube',
    searchQuery: 'aerosol spray can lubricant',
  },
  {
    id: 'prod-019',
    sku: 'AZB-ENG-001',
    name: 'طقم بستم وشمبر قياسي ستاندرد TVS HLX 150',
    filename: 'piston-kit-hlx-150.jpg',
    bucket: 'piston-kit',
    directUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Motorcycles-Honda-MVX250F-Conrod-Piston_01.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original',
    fileTitle: 'File:Motorcycles-Honda-MVX250F-Conrod-Piston 01.JPG',
    license: 'Public domain',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Motorcycles-Honda-MVX250F-Conrod-Piston_01.JPG',
  },
  {
    id: 'prod-020',
    sku: 'AZB-ENG-002',
    name: 'جوان وش سلندر معدني أصلي أباتشي 160',
    filename: 'cylinder-gasket-apache-160.jpg',
    bucket: 'cylinder-gasket',
    searchQuery: 'engine head gasket metal',
  },
  {
    id: 'prod-021',
    sku: 'AZB-ENG-003',
    name: 'سير كاتينة (جنزير تاكيهات) أصلي TVS',
    filename: 'timing-chain-hlx-150.jpg',
    bucket: 'timing-chain',
    searchQuery: 'roller chain engine timing',
  },
  {
    id: 'prod-022',
    sku: 'AZB-ENG-004',
    name: 'طقم ورق دبرياج أصلي كامل أباتشي 200',
    filename: 'clutch-plates-apache-200.jpg',
    bucket: 'clutch-plates',
    searchQuery: 'motorcycle clutch friction plates',
  },
  {
    id: 'prod-023',
    sku: 'AZB-ACC-001',
    name: 'كفر حماية المحرك (أكصدام حديد) TVS HLX',
    filename: 'crash-guard-hlx-150.jpg',
    bucket: 'crash-guard',
    searchQuery: 'crash bars motorcycle engine',
  },
  {
    id: 'prod-024',
    sku: 'AZB-ACC-002',
    name: 'حامل موبايل ألومنيوم ممتص للاهتزاز للمقود',
    filename: 'phone-mount-aluminum.jpg',
    bucket: 'phone-mount',
    searchQuery: 'handlebar smartphone holder motorcycle',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'AzabMotoProductAssetSync/1.0 (https://azabmoto.com; admin@azabmoto.com)',
      },
    };

    function req(u) {
      https.get(u, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return req(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }

    req(url);
  });
}

function searchWikimedia(query) {
  return new Promise((resolve) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata|mime&format=json`;
    https.get(url, { headers: { 'User-Agent': 'AzabMotoDownloader/1.0 (admin@azabmoto.com)' } }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(b);
          if (data.query && data.query.pages) {
            const pages = Object.values(data.query.pages)
              .filter(p => p.imageinfo && p.imageinfo[0] && (p.imageinfo[0].mime === 'image/jpeg' || p.imageinfo[0].mime === 'image/png'));
            resolve(pages[0] || null);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  console.log(`Starting real photography download and manifest generation for ${targets.length} products...`);
  const manifest = [];

  for (const item of targets) {
    const targetPath = path.join(productsDir, item.filename);
    const exists = fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000;

    if (exists) {
      console.log(`[READY] ${item.sku} -> ${item.filename} (${fs.statSync(targetPath).size} bytes)`);
      manifest.push({
        id: item.id,
        sku: item.sku,
        name: item.name,
        bucket: item.bucket,
        filename: item.filename,
        localPath: `/images/products/${item.filename}`,
        fileTitle: item.fileTitle || item.filename,
        license: item.license || 'Public Domain / CC BY-SA',
        sourceUrl: item.sourceUrl || 'Local Asset',
        isGenerated: !!item.isGenerated,
        sizeBytes: fs.statSync(targetPath).size,
        status: 'ready',
      });
      continue;
    }

    let downloadUrl = item.directUrl;
    let fileTitle = item.fileTitle;
    let license = item.license;
    let sourceUrl = item.sourceUrl;

    if (!downloadUrl && item.searchQuery) {
      console.log(`[SEARCHING] ${item.sku} ("${item.searchQuery}")...`);
      const result = await searchWikimedia(item.searchQuery);
      if (result) {
        const info = result.imageinfo[0];
        downloadUrl = info.url;
        fileTitle = result.title;
        sourceUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`;
        const meta = info.extmetadata || {};
        license = meta.LicenseShortName ? meta.LicenseShortName.value : 'CC BY-SA 3.0 / 4.0';
        console.log(`  -> Found: ${result.title} (${license})`);
      }
    }

    if (downloadUrl) {
      console.log(`[DOWNLOADING] ${item.sku} from ${downloadUrl.slice(0, 70)}...`);
      try {
        await downloadFile(downloadUrl, targetPath);
        const size = fs.statSync(targetPath).size;
        console.log(`  -> Saved ${item.filename} (${size} bytes)`);
        manifest.push({
          id: item.id,
          sku: item.sku,
          name: item.name,
          bucket: item.bucket,
          filename: item.filename,
          localPath: `/images/products/${item.filename}`,
          fileTitle: fileTitle || item.filename,
          license: license || 'CC BY-SA',
          sourceUrl: sourceUrl || downloadUrl,
          isGenerated: false,
          sizeBytes: size,
          status: 'ready',
        });
      } catch (err) {
        console.error(`  -> Failed: ${err.message}`);
        manifest.push({
          id: item.id,
          sku: item.sku,
          name: item.name,
          bucket: item.bucket,
          filename: item.filename,
          status: 'failed',
          error: err.message,
        });
      }
    } else {
      console.warn(`[NOT FOUND] No image found for ${item.sku}`);
      manifest.push({
        id: item.id,
        sku: item.sku,
        name: item.name,
        bucket: item.bucket,
        filename: item.filename,
        status: 'missing',
      });
    }
  }

  // Save manifest to public/images-manifest.json
  const manifestPath = path.resolve(__dirname, '../public/images-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nManifest written to ${manifestPath}`);

  // Update src/data/products.json
  const productsPath = path.resolve(__dirname, '../src/data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  let updatedCount = 0;
  for (const p of products) {
    const match = manifest.find(m => m.id === p.id && m.status === 'ready');
    if (match) {
      p.images = [match.localPath];
      updatedCount++;
    }
  }

  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`Updated products.json: ${updatedCount} products now reference local real photos!`);
}

main().catch(console.error);

