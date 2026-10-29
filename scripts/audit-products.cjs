const fs = require('fs');
const path = require('path');

const productsPath = path.resolve('src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('Total products in catalog:', products.length);

const results = products.map((p) => {
  const images = p.images || [];
  const firstImg = images[0] || '';
  
  let state = 'missing';
  let localPath = '';
  
  if (firstImg.startsWith('/images/products/') || firstImg.startsWith('/images/models/')) {
    const fsPath = path.resolve('public' + firstImg);
    if (fs.existsSync(fsPath)) {
      state = 'real photo (local)';
      localPath = fsPath;
    } else {
      state = 'broken local link';
    }
  } else if (firstImg.startsWith('http')) {
    state = 'external url (wikimedia)';
  } else if (!firstImg) {
    state = 'no image (SVG fallback)';
  }

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    nameEn: p.nameEn,
    category: p.categoryId,
    firstImg,
    state,
  };
});

console.log('\n--- PRODUCT IMAGE AUDIT TABLE ---');
console.table(
  results.map((r) => ({
    ID: r.id,
    Name: r.name.slice(0, 32),
    Category: r.category,
    State: r.state,
    Image: r.firstImg.slice(0, 45) + (r.firstImg.length > 45 ? '...' : ''),
  }))
);

const missingOrExternal = results.filter((r) => r.state !== 'real photo (local)');
console.log(`\nProducts with local real photo: ${results.length - missingOrExternal.length} / ${results.length}`);
console.log(`Products needing local real photography: ${missingOrExternal.length}`);
console.log('\nList of products needing real photography:');
missingOrExternal.forEach((p) => {
  console.log(`- [${p.id}] ${p.sku} | ${p.name} (${p.category})`);
});

