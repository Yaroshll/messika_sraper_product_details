export async function extractDescription(page) {
    const mainDesc = await page.$eval('div.content > div', el => el.textContent.trim());
    const details = await page.$eval('div.content div p', el => el.textContent.trim());
    const sizingInfo = await page.$eval('div.content div p:last-child', el => {
        return el.textContent.replace(/<a[^>]*>.*?<\/a>/g, '').trim();
    });

    return {
        firstParagraph: mainDesc.split('\n')[0], // Get first paragraph only
        productDetails: details,
        sizingInfo: sizingInfo
    };
}

export async function extractSKU(page) {
    const referenceText = await page.$eval('div.content div p', el => el.textContent.trim());
    const match = referenceText.match(/Référence : (.+?)(\n|$)/);
    return match ? match[1].trim() : '';
}

export function formatDescription(desc) {
    return `Détails\n${desc.productDetails}\n\n${desc.sizingInfo}`;
}
 console.info("description Done");