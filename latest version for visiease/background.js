const API_KEY = 'secreat code';  // Replace with your actual API key

// Listening for messages from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fetchDescriptions" && request.imageUrls) {
        console.log('Received image URLs:', request.imageUrls);  // Debugging: Log received URLs
        fetchDescriptions(request.imageUrls).then(descriptions => {
            console.log('Sending descriptions:', descriptions);  // Debugging: Log descriptions being sent
            sendResponse({ descriptions });
        }).catch(error => {
            console.error('Error fetching descriptions:', error);
            sendResponse({ error: 'Failed to fetch descriptions', details: error.toString() });
        });
        return true;  // Indicates an asynchronous response is expected
    }
});

async function fetchDescriptions(imageUrls) {
    const descriptions = [];
    for (const imageUrl of imageUrls) {
        try {
            const description = await fetchDescription(imageUrl);
            descriptions.push(description);
        } catch (error) {
            console.error('Failed to fetch description for:', imageUrl, error);
            descriptions.push('Description unavailable');  // Default error description
        }
    }
    return descriptions;
}

async function fetchDescription(imageUrl) {
    const payload = {
        model: "gpt-4.0-turbo",  // Ensure this is the correct model name
        prompt: "Describe this image for a blind person.",  // Update prompt as necessary
        images: [imageUrl],
        max_tokens: 512
    };

    const response = await fetch('https://api.openai.com/v1/images/generate', {  // Ensure URL is correct
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0 || !data.choices[0].text) {
        throw new Error('No description available or bad API response');
    }

    return data.choices[0].text;
}