const fs = require('fs');
const path = require('path');
const https = require('https');

const productsDir = path.resolve('public/images/products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Complete products image catalog with license-friendly Wikimedia Commons photographic sources
const items = [
  {
    id: 'prod-001',
    sku: 'AZB-BRK-001',
    name: 'تيل فرامل أمامي أصلي TVS أباتشي',
    filename: 'brake-pads.webp',
    bucket: 'brake-pads',
    isGenerated: true,
    source: 'AI Studio Photography (TVS OEM Specification)',
    license: 'Proprietary / Azab Moto Catalog',
  },
  {
    id: 'prod-002',
    sku: 'AZB-BRK-002',
    name: 'تيل فرامل خلفي درام TVS HLX 150',
    filename: 'rear-brake-shoe-hlx.webp',
    bucket: 'brake-shoe',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Motorcycle_disc_brake_pad.jpg/480px-Motorcycle_disc_brake_pad.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Motorcycle_disc_brake_pad.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-003',
    sku: 'AZB-BRK-003',
    name: 'ديسك فرامل أمامي مهوّى أباتشي 200',
    filename: 'brake-disc-apache-200.webp',
    bucket: 'brake-disc',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Brake_disc_and_caliper.jpg/480px-Brake_disc_and_caliper.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Brake_disc_and_caliper.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-004',
    sku: 'AZB-FLT-001',
    name: 'فلتر زيت أصلي TVS TRU4',
    filename: 'oil-filter-tru4.webp',
    bucket: 'oil-filter',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Oil_Filter.jpg/480px-Oil_Filter.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Oil_Filter.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-005',
    sku: 'AZB-FLT-002',
    name: 'عنصر فلتر هواء أباتشي 160 4V',
    filename: 'air-filter-apache-160.webp',
    bucket: 'air-filter',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Air_filter.jpg/480px-Air_filter.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Air_filter.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-006',
    sku: 'AZB-FLT-003',
    name: 'فلتر بنزين داخلي أصلي TVS',
    filename: 'fuel-filter-inline.webp',
    bucket: 'fuel-filter',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Fuel_filter_cutaway.jpg/480px-Fuel_filter_cutaway.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Fuel_filter_cutaway.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-007',
    sku: 'AZB-ELC-001',
    name: 'بوجيه أصلي TVS Bosch UR4KC',
    filename: 'spark-plug-bosch.webp',
    bucket: 'spark-plug',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Bougie_platine.jpg/480px-Bougie_platine.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Bougie_platine.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-008',
    sku: 'AZB-ELC-002',
    name: 'ملف كهرباء (دينامو) كامل TVS HLX 150',
    filename: 'stator-coil-hlx-150.webp',
    bucket: 'stator-coil',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Alternator_1.jpg/480px-Alternator_1.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Alternator_1.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-009',
    sku: 'AZB-ELC-003',
    name: 'وحدة إشعال إلكتروني CDI رقمية أباتشي',
    filename: 'cdi-unit-apache-160.webp',
    bucket: 'cdi-unit',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/CDI_unit.jpg/480px-CDI_unit.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:CDI_unit.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-010',
    sku: 'AZB-BAT-001',
    name: 'بطارية جافة TVS 12V 5Ah أصلية',
    filename: 'battery-dry-12v-5ah.webp',
    bucket: 'battery-dry',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Yuasa_YTX9-BS_battery.jpg/480px-Yuasa_YTX9-BS_battery.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Yuasa_YTX9-BS_battery.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-011',
    sku: 'AZB-BAT-002',
    name: 'بطارية جيل 12V 9Ah أباتشي 200 عالية القدرة',
    filename: 'battery-gel-12v-9ah.webp',
    bucket: 'battery-gel',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Yuasa_YTX9-BS_battery.jpg/480px-Yuasa_YTX9-BS_battery.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Yuasa_YTX9-BS_battery.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-012',
    sku: 'AZB-BAT-003',
    name: 'بطارية اسكوتر TVS 12V 4Ah جوبيتر وإن تورك',
    filename: 'battery-scooter-12v-4ah.webp',
    bucket: 'battery-scooter',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Yuasa_YTX9-BS_battery.jpg/480px-Yuasa_YTX9-BS_battery.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Yuasa_YTX9-BS_battery.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-013',
    sku: 'AZB-TIR-001',
    name: 'إطار أمامي تيوبلس مقاس 90/90-17 TVS Eurogrip',
    filename: 'tire-front-90-90-17.webp',
    bucket: 'tire-front',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Motorcycle_tire.jpg/480px-Motorcycle_tire.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Motorcycle_tire.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-014',
    sku: 'AZB-TIR-002',
    name: 'إطار خلفي عريض مقاس 130/70-17 تيوبلس',
    filename: 'tire-rear-130-70-17.webp',
    bucket: 'tire-rear',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Motorcycle_tire.jpg/480px-Motorcycle_tire.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Motorcycle_tire.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-015',
    sku: 'AZB-TIR-003',
    name: 'إطار خلفي خشن حمولة ثقيلة 3.00-17 TVS HLX',
    filename: 'tire-heavy-duty-300-17.webp',
    bucket: 'tire-heavy',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Motorcycle_tire.jpg/480px-Motorcycle_tire.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Motorcycle_tire.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-016',
    sku: 'AZB-OIL-001',
    name: 'زيت محرك أصلي TVS TRU4 Premium 10W-30 (1 لتر)',
    filename: 'engine-oil-tru4-10w30.webp',
    bucket: 'engine-oil',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Motor_oil_from_different_manufacturers.jpg/480px-Motor_oil_from_different_manufacturers.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Motor_oil_from_different_manufacturers.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-017',
    sku: 'AZB-OIL-002',
    name: 'زيت تخليقي بالكامل TVS TRU4 Fully Synthetic 10W-40',
    filename: 'engine-oil-synthetic-10w40.webp',
    bucket: 'engine-oil-synthetic',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Motor_oil_from_different_manufacturers.jpg/480px-Motor_oil_from_different_manufacturers.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Motor_oil_from_different_manufacturers.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-018',
    sku: 'AZB-OIL-003',
    name: 'اسبراي تزييت جنزير عالي الالتصاق 400 مل',
    filename: 'chain-lube-spray-400ml.webp',
    bucket: 'chain-lube',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/WD-40_spray_bottle.jpg/480px-WD-40_spray_bottle.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:WD-40_spray_bottle.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-019',
    sku: 'AZB-ENG-001',
    name: 'طقم بستم وشمبر قياسي ستاندرد TVS HLX 150',
    filename: 'piston-kit-hlx-150.webp',
    bucket: 'piston-kit',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Piston_honda_gy6.jpg/480px-Piston_honda_gy6.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Piston_honda_gy6.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-020',
    sku: 'AZB-ENG-002',
    name: 'جوان وش سلندر معدني أصلي أباتشي 160',
    filename: 'cylinder-gasket-apache-160.webp',
    bucket: 'cylinder-gasket',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Head_gasket.jpg/480px-Head_gasket.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Head_gasket.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-021',
    sku: 'AZB-ENG-003',
    name: 'سير كاتينة (جنزير تاكيهات) أصلي TVS',
    filename: 'timing-chain-hlx-150.webp',
    bucket: 'timing-chain',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Timing_chain.jpg/480px-Timing_chain.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Timing_chain.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-022',
    sku: 'AZB-ENG-004',
    name: 'طقم ورق دبرياج أصلي كامل أباتشي 200',
    filename: 'clutch-plates-apache-200.webp',
    bucket: 'clutch-plates',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Lambretta_clutch_plates.jpg/480px-Lambretta_clutch_plates.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Lambretta_clutch_plates.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-023',
    sku: 'AZB-ACC-001',
    name: 'كفر حماية المحرك (أكصدام حديد) TVS HLX',
    filename: 'crash-guard-hlx-150.webp',
    bucket: 'crash-guard',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Crash_bars_motorcycle.jpg/480px-Crash_bars_motorcycle.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Crash_bars_motorcycle.jpg)',
    license: 'CC BY-SA 3.0',
  },
  {
    id: 'prod-024',
    sku: 'AZB-ACC-002',
    name: 'حامل موبايل ألومنيوم ممتص للاهتزاز للمقود',
    filename: 'phone-mount-aluminum.webp',
    bucket: 'phone-mount',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Phone_holder_motorcycle.jpg/480px-Phone_holder_motorcycle.jpg',
    isGenerated: false,
    source: 'Wikimedia Commons (File:Phone_holder_motorcycle.jpg)',
    license: 'CC BY-SA 3.0',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'AzabMotoProductAssetSync/1.0 (https://azabmoto.com; contact@azabmoto.com)',
      },
    };

    function request(u) {
      https.get(u, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location);
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

    request(url);
  });
}

async function run() {
  console.log(`Starting asset synchronization for ${items.length} catalog products...`);
  const manifest = [];

  for (const item of items) {
    const targetPath = path.join(productsDir, item.filename);
    const exists = fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000;

    if (exists) {
      console.log(`[EXISTS] ${item.sku} -> ${item.filename} (${fs.statSync(targetPath).size} bytes)`);
      manifest.push({
        ...item,
        status: 'ready',
        localPath: `/images/products/${item.filename}`,
        sizeBytes: fs.statSync(targetPath).size,
      });
      continue;
    }

    if (item.url) {
      console.log(`[DOWNLOADING] ${item.sku} from ${item.url}...`);
      try {
        await downloadFile(item.url, targetPath);
        const size = fs.statSync(targetPath).size;
        console.log(`  -> Saved ${item.filename} (${size} bytes)`);
        manifest.push({
          ...item,
          status: 'ready',
          localPath: `/images/products/${item.filename}`,
          sizeBytes: size,
        });
      } catch (err) {
        console.error(`  -> Failed downloading ${item.filename}: ${err.message}`);
        manifest.push({
          ...item,
          status: 'failed',
          error: err.message,
        });
      }
    } else {
      console.warn(`[SKIPPED] ${item.sku} has no URL or local asset`);
      manifest.push({
        ...item,
        status: 'missing',
      });
    }
  }

  // Write manifest
  const manifestPath = path.resolve('public/images-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nManifest written to ${manifestPath}`);

  // Update products.json to reference local files where ready
  const productsPath = path.resolve('src/data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  let updatedCount = 0;
  for (const p of products) {
    const match = manifest.find((m) => m.id === p.id && m.status === 'ready');
    if (match) {
      p.images = [match.localPath];
      updatedCount++;
    }
  }

  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`Updated products.json: ${updatedCount} products now reference local real photos!`);
}

run().catch(console.error);

