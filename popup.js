// popup.js
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "get_product_data"}, function(response) {
    document.getElementById('product-title').textContent = response.productTitle;
    document.getElementById('price').textContent = response.price;
    document.getElementById('rating').textContent = response.rating;
    document.getElementById('reviews').textContent = response.reviews;

    getSummary(response.summary, response.features)
    .then(summary => {
 	    document.getElementById('summary').textContent = summary;
    });

    getBuyScore(response)
    .then(data => {
 	    document.getElementById('buy').textContent = data;
    });
  });
});


function getSummary(summary, features){
  const joinedText = `${summary}\n${features.join(', ')}`;
  const prompt = `summarize the following product description in 100 words or less: ${joinedText}`;
  const maxTokens = 100;

  return fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer API_KEY`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: maxTokens
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      return "data error:" + data.error.message;
    } else if (data.choices && data.choices.length > 0 && data.choices[0].text) {
      return data.choices[0].text.trim();
    } else {
      return "No Completion";
    }
  })
  .catch(error => {
    return "error:" + error;
  });
}

function getBuyScore(review){
	const prompt = `Based on the following review details, generate a Buy Score between 0 and 100, where 0 means 'don't buy' and 100 means 'definitely buy':\n\nTitle: ${review.productTitle}\nDescription: ${review.summary}\nStars: ${review.rating}\nReaction: ${review.reviews}\n\nBuy Score:`;
	const maxTokens = 100;

	return fetch('https://api.openai.com/v1/completions', {
	  method: 'POST',
	  headers: {
		'Authorization': `Bearer API_KEY`,
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({
		model: 'text-davinci-003',
		prompt: prompt,
		max_tokens: maxTokens
	  })
	})
	.then(response => response.json())
	.then(data => {
		if (data.error) {
			return "data error:" + data.error.message;
		} else if (data.choices && data.choices.length > 0 && data.choices[0].text) {
			return data.choices[0].text.trim();
		} else {
			return "No Completion";
		}
	})
	.catch(error => {
		return "error:" + error;
	});
}
