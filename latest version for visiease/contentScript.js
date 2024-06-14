console.log('Content script loaded');

// Add a listener to respond to messages from the popup or other components
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "describeImages") {
        console.log('Describe images action triggered');
        describeImages(); // Call the function to describe images
    }
});

// This function describes images by sending their URLs to the background script
function describeImages() {
    const images = document.getElementsByTagName('img');
    if (images.length === 0) {
        console.log('No images found on this page.');
        return;
    }

    const imageUrls = Array.from(images).map(img => img.src);
    console.log('Collected image URLs:', imageUrls);

    chrome.runtime.sendMessage({ action: "fetchDescriptions", imageUrls: imageUrls }, function(response) {
        if (!response || !response.descriptions) {
            console.error('Failed to receive descriptions or error in fetching them.');
            return;
        }

        console.log('Received descriptions from background script:', response.descriptions);
        applyDescriptionsToImages(images, response.descriptions);
    });
}

// Function to apply descriptions to images as pop-up tooltips
function applyDescriptionsToImages(images, descriptions) {
    descriptions.forEach((desc, index) => {
        if (images[index]) {
            console.log(`Creating pop-up for image ${index} with description: ${desc}`);

            // Create a description element
            const descriptionElement = document.createElement('div');
            descriptionElement.style.position = 'absolute';
            descriptionElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            descriptionElement.style.color = 'white';
            descriptionElement.style.padding = '10px';
            descriptionElement.style.borderRadius = '5px';
            descriptionElement.style.zIndex = '1000';
            descriptionElement.innerText = desc;
            descriptionElement.style.display = 'block'; // Always display the description

            // Position the description element near the image
            const rect = images[index].getBoundingClientRect();
            descriptionElement.style.top = `${rect.top + window.scrollY + images[index].height + 10}px`;
            descriptionElement.style.left = `${rect.left + window.scrollX}px`;

            // Append the description element to the body
            document.body.appendChild(descriptionElement);
        }
    });
}

// Only listen for the button click if the script is operating in a context where the button exists
if (document.getElementById('myButton')) {
    document.addEventListener('DOMContentLoaded', function () {
        const button = document.getElementById('myButton');
        button.addEventListener('click', async () => {
            console.log('Button clicked');
            describeImages();
        });
    });
}