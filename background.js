// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_reviews") {
    let asin = request.asin;
    
    // Construct reviews page URL
    let url = "https://www.amazon.com/product-reviews/" + asin + "?reviewerType=avp_only_reviews";

    fetch(url).then(response => response.text()).then(data => {
      // Parse review data from HTML
      let parser = new DOMParser();
      let doc = parser.parseFromString(data, "text/html");
      
      // Get the review containers
      let reviewContainers = doc.querySelectorAll('.review');
      
      let reviews = Array.from(reviewContainers).map(container => {
        // Get the review title, body, and star rating
        let title = container.querySelector('.review-title').innerText;
        let body = container.querySelector('.review-text').innerText;

        // Extract star rating from class
        let starClass = container.querySelector('.review-rating').getAttribute('class');
        let starRatingMatch = starClass.match(/a-star-([0-9]+)/);
        let starRating = starRatingMatch ? starRatingMatch[1] : null;

        return { title, body, starRating };
      });

      sendResponse({ reviews: reviews });
    });
    
    return true;  // Will respond asynchronously
  }
});
