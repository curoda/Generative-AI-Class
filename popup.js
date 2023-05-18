// popup.js
const OPEN_AI_API = 'https://api.openai.com/v1/completions';
const MAX_TOKENS = 200;
const MODEL = 'gpt-3.5-turbo';
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key

chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {message: "get_product_data"}, async function(response) {
    document.getElementById('product-title').textContent = response.productTitle;
    document.getElementById('price').textContent = response.price;
    document.getElementById('rating').textContent = response.rating;
    document.getElementById('reviews').textContent = response.reviews;

    try {
      const summary = await getSummary(response.summary, response.features);
      document.getElementById('summary').textContent = summary;

      const buyScore = await getBuyScore(response);
      document.getElementById('buy').textContent = buyScore;
    } catch(error) {
      console.error("Error in fetching data from OpenAI API", error);
    }
  });
});

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
      top-p: 0.2
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
  const prompt = `Summarize this product based on this information: ${joinedText}`;

  return callOpenAiApi(prompt);
}

function getBuyScore(review){
  const prompt = `Based on the following review details, generate a Buy Score between 0 and 100, where 0 means 'don't buy' and 100 means 'definitely buy':\n\nTitle: ${review.productTitle}\nDescription: ${review.summary}\nStars: ${review.rating}\nReaction: ${review.reviews}\n\nBuy Score:`;

  return callOpenAiApi(prompt);
}
