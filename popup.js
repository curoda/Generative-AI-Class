// popup.js
const OPEN_AI_API = 'https://api.openai.com/v1/completions';
const MAX_TOKENS = 200;
const MODEL = 'text-davinci-003';
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "get_product_data"}, async function(response) {
    document.getElementById('product-title').textContent = truncateTitle(response.productTitle);
    document.getElementById('price').textContent = response.price;
    //document.getElementById('rating').textContent = response.rating;
    
    
    // Create one big blob of text from the reviews array
    let reviewsText = response.reviews.map((review, index) => {
      return `Review ${index+1}:\nTitle: ${review.title}\nBody: ${review.body}\nStar Rating: ${review.starRating}\n\n`;
    }).join('');

    console.log(reviewsText); // or use this string in your desired way
    document.getElementById('reviews').textContent = reviewsText;

    try {
      const summary = await getSummary(response.summary, response.features);
      document.getElementById('highlights').innerHTML = summary;
    } catch(error) {
      console.error("Error in fetching highlights data from OpenAI API", error);
    }
    try {
      const buyScore = await getBuyScore(response);
      document.getElementById('buy-score').textContent = buyScore;
    } catch(error) {
      console.error("Error in fetching buy score data from OpenAI API", error);
    }
  });
});

function truncateTitle(title) {
    if (title.length > 50) {
        return title.substring(0, 50) + '...';
    } else {
        return title;
    }
}

async function callOpenAiApi(prompt) {
  const response = await fetch(OPEN_AI_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt,
      max_tokens: MAX_TOKENS,
      temperature: 0,
      top_p: 0.2
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  } else if (data.choices && data.choices.length > 0 && data.choices[0].text) {
    return data.choices[0].text.trim();
  } else {
    throw new Error("No Completion from OpenAI API");
  }
}

function getSummary(summary, features) {
  const joinedText = `${summary}\n${features.join(', ')}`;
  const prompt = `summarize the following product description into 8 or fewer bullet points.  Return it as html code using <ul> and <li> tags ${joinedText}`;

  return callOpenAiApi(prompt);
}

function getBuyScore(review){
  const prompt = `Based on the following review details, generate a Buy Score between 0 and 100, where 0 means 'don't buy' and 100 means 'definitely buy':\n\nTitle: ${review.productTitle}\nDescription: ${review.summary}\nStars: ${review.rating}\nReaction: ${review.reviews}\n\nBuy Score:`;

  return callOpenAiApi(prompt);
}
