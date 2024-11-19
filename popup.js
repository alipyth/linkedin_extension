document.getElementById("start-scraping").addEventListener("click", () => {
    const scrollLimit = document.getElementById("scroll-limit").value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: scrapeLinkedIn,
            args: [parseInt(scrollLimit)]
        });
    });
});

document.getElementById("start-scraping").addEventListener("click", () => {
    const scrollLimit = document.getElementById("scroll-limit").value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: scrapeLinkedIn,
            args: [parseInt(scrollLimit)]
        });
    });
});

function scrapeLinkedIn(scrollLimit) {
    let scrapedData = [];

    const scrapePosts = () => {
        const posts = document.querySelectorAll(
            ".feed-shared-inline-show-more-text.feed-shared-inline-show-more-text--3-lines"
        );
        const usernames = document.querySelectorAll(".update-components-actor__single-line-truncate");
        const dates = document.querySelectorAll(".update-components-actor__sub-description");
        const bios = document.querySelectorAll(".update-components-actor__description");
        const images = document.querySelectorAll(
            ".update-components-image--smart-grid .update-components-image__container .update-components-image__image-link"
        );

        posts.forEach((post, index) => {
            const text = post.innerText.trim() || "none";
            const username = usernames[index]?.innerText.trim() || "none";
            const date = dates[index]?.innerText.trim() || "none";
            const bio = bios[index]?.innerText.trim() || "none";

            // Collect all image URLs in the post
            const imageLinks = Array.from(images[index]?.querySelectorAll("img") || []).map(
                (img) => img.src
            );

            const postData = {
                text,
                username,
                date,
                bio,
                images: imageLinks.length > 0 ? imageLinks : ["none"], // Add images or "none"
            };

            scrapedData.push(postData);
        });
    };

    const randomDelay = () => {
        // Generate a random delay between 1 and 3 seconds
        return Math.floor(Math.random() * 2000) + 1000; // 1000ms to 3000ms
    };

    let scrollCount = 0;

    const scrollPage = () => {
        window.scrollBy(0, window.innerHeight);
        scrollCount++;

        if (scrollCount < scrollLimit) {
            setTimeout(scrollPage, randomDelay()); // Random delay between scrolls
        } else {
            downloadData();
        }
    };

    const downloadData = () => {
        const blob = new Blob([JSON.stringify(scrapedData, null, 2)], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "linkedin_posts.txt";
        link.click();
        URL.revokeObjectURL(url);
    };

    scrapePosts();
    scrollPage();
}
