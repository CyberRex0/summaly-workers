export default async function (url: string, maxRetries: number = 5) {
    let currentUrl = url;
    let count = 0;

    while (true) {
        if (count > maxRetries) {
            throw new Error('Max retry exceeded');
        }
        const response = await fetch(currentUrl, { redirect: 'follow' });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const finalUrl = response.url;

        if (finalUrl === currentUrl) {
            return finalUrl;
        }
        
        currentUrl = finalUrl;
        count++;
    }
}