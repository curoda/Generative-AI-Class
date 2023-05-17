// contentscript.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_product_data") {
    let productTitle = document.querySelector('#productTitle')?.innerText;
    let summary = document.querySelector('#featurebullets_feature_div')?.innerText;
    let features = Array.from(document.querySelectorAll('#feature-bullets li')).map(li => li.innerText);
    let price = document.querySelector('.a-price-whole')?.innerText;
    let rating = document.querySelector('#averageCustomerReviews span')?.innerText;
    let reviews = document.querySelector('#acrCustomerReviewText')?.innerText;
    
    sendResponse({
      productTitle: productTitle,
      summary: summary,
      features: features,
      price: price,
      rating: rating,
      reviews: reviews
    });
  }
});
