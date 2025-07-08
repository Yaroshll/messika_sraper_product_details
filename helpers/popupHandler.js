export async function handlePopup(page) {
    try {
        // Wait for modal to appear (with timeout)
        await page.waitForSelector('section.modal.light.visible', { timeout: 3000 });
        
        // Click the close button
        await page.click('section.modal.light.visible button.close');
        
        // Wait for modal to disappear
        await page.waitForSelector('section.modal.light.visible', { state: 'hidden', timeout: 3000 });
        
        console.log('Popup closed successfully');
        return true;
    } catch (error) {
        console.log('No popup found or already closed');
        return false;
    }
}

export function setupDialogHandler(page) {
    page.on('dialog', async dialog => {
        console.log('Dialog detected:', dialog.message());
        await dialog.dismiss();
    });
}