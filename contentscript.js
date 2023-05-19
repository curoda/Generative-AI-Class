// contentscript.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_product_data") {
    let productTitle = document.querySelector('#productTitle')?.innerText;
    let summary = document.querySelector('#featurebullets_feature_div')?.innerText;
    let features = Array.from(document.querySelectorAll('#feature-bullets li')).map(li => li.innerText);

    // Get the price symbol, whole, and fraction
    let priceSymbol = document.querySelector('.a-price-symbol')?.innerText || "";
    let priceWhole = document.querySelector('.a-price-whole')?.innerText || "";
    let priceFraction = document.querySelector('.a-price-fraction')?.innerText || "";
    let price = `${priceSymbol}${priceWhole}.${priceFraction}`;

    let rating = document.querySelector('#averageCustomerReviews span')?.innerText;

    // Get current URL and extract ASIN
    let url = window.location.href;
    let asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    let asin = asinMatch ? asinMatch[1] : null;

    // Request reviews from background script
    chrome.runtime.sendMessage({message: "get_reviews", asin: asin}, response => {
      let reviews = response.reviews;

      sendResponse({
        productTitle: productTitle,
        summary: summary,
        features: features,
        price: price,
        rating: rating,
        reviews: reviews,
        asin: asin
      });
    });

    return true;  // Indicate that we will respond asynchronously
  }
});


