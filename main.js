import { chromium } from 'playwright';
import { handlePopup, setupDialogHandler } from './helpers/popupHandler.js';
import { extractDescription, formatDescription } from './helpers/descriptionHelper.js';
import { saveToExcel } from './helpers/saveToExcel.js';

async function scrapeMessikaProduct(url) {
    const browser = await chromium.launch({
        headless: false,
        channel: "chrome",
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ],
        timeout: 12000,
    });

    const page = await browser.newPage();
    setupDialogHandler(page);
    await page.goto(url);
    await handlePopup(page);

    const handle = url.split('/').pop();
     async function extractAllImages(page) {
        return await page.$$eval('div.product-asset-image picture img', imgs => 
            imgs.map(img => img.src)
        );
    }
    
     function extractSkuFromHandle(handle) {
        const match = handle.match(/-(\d+)-/);
        return match ? match[1] : '';
    }
    const images = await extractAllImages(page);

    const product = {
        url: url,
        handle: handle,
        sku: extractSkuFromHandle(handle),
        title: await page.$eval('span.title-h3.product-title', el => el.textContent.trim()),
        cost: await page.$eval('p.price', el => {
            const priceText = el.textContent.replace(/[^\d,]/g, '').replace(',', '.');
            return parseFloat(priceText);
        }),
        breadcrumbs: await page.$$eval('div.breadcrumbs ul li', items =>
            items.map(item => item.textContent.trim()).filter(item => item)
        ),
        images: images,
        mainImage: images[0],
        description: await extractDescription(page),
    };

    product.variantPrice = (product.cost * 21.3).toFixed(2);
    product.compareAtPrice = (product.variantPrice * 1.2).toFixed(2);
    product.bodyHTML = formatDescription(product.description);

    await browser.close();
    return product;
}


(async () => {
    try {
        // ✅ this array contains the product URLs mustbe change it at every run
        const productUrls = [
            'https://www.messika.com/ar_ar/move-link-diamond-solitaire-ring-white-gold-13748-wg',
            'https://www.messika.com/ar_ar/move-uno-drop-pendant-diamond-choker-necklace-white-gold-12150-wg'
        ];

        const products = [];

        for (const url of productUrls) {
            console.log(`🔍 Scraping: ${url}`);
            const product = await scrapeMessikaProduct(url);
            products.push(product);
        }

        await saveToExcel(products); // ✅ Saves all products in one file
        console.log('✅ All products scraped and saved!');
    } catch (error) {
        console.error('❌ Scraping failed:', error);
    }
})();
