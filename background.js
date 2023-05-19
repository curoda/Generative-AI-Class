// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_reviews") {
    let asin = request.asin;
    
    // Construct reviews page URL
    let url = "https://www.amazon.com/product-reviews/" + asin + "?reviewerType=avp_only_reviews";

    fetch(url)
      .then(response => response.text())
      .then(htmlText => {
        // Use regular expressions to find review titles, bodies and star ratings in the HTML text
        let titleMatches = htmlText.match(/data-hook="review-title".*?>.*?<\/span>/g) || [];
        let bodyMatches = htmlText.match(/data-hook="review-body".*?>.*?<\/span>/g) || [];
        let starRatingMatches = htmlText.match(/data-hook="review-star-rating".*?>.*?<\/i>/g) || [];

        // Extract the actual titles, bodies, and star ratings from the matched strings
        let reviewTitles = titleMatches.map(str => str.replace(/.*data-hook="review-title".*?>(.*?)<\/span>/, "$1").trim());
        let reviewBodies = bodyMatches.map(str => str.replace(/.*data-hook="review-body".*?>(.*?)<\/span>/, "$1").trim());
        
        // Extract the star ratings from the inner span element of the matched strings
        let reviewStarRatings = starRatingMatches.map(str => {
            let match = str.match(/<span class="a-icon-alt">(.*?)<\/span>/);
            return match ? match[1] : "";
        });

        // Pair up the titles, bodies and star ratings into an array of review objects
        let reviews = reviewTitles.map((title, i) => ({ 
          title: title, 
          body: reviewBodies[i],
          starRating: reviewStarRatings[i]
        }));

        sendResponse({ reviews: reviews });
      })
      .catch(error => console.error("Error fetching reviews:", error));

    return true;  // Will respond asynchronously
  }
});


