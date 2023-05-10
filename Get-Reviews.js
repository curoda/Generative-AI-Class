const openai = require("openai");
const Apify = require("apify");
const { config } = require("dotenv");
config();

openai.apiKey = process.env.OPENAI_API_KEY;

async function generateBuyScore(review) {
  const prompt = `Based on the following review details, generate a Buy Score between 0 and 100, where 0 means 'don't buy' and 100 means 'definitely buy':\n\nTitle: ${review.reviewTitle}\nDescription: ${review.reviewDescription}\nStars: ${review.ratingScore}\nReaction: ${review.reviewReaction}\n\nBuy Score:`;

  try {
    const response = await openai.Completion.create({
      engine: "text-davinci-002",
      prompt,
      max_tokens: 10,
      n: 1,
      stop: null,
      temperature: 0.5,
    });

    const score = parseInt(response.choices[0].text.trim(), 10);
    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    return 0;
  }
}

async function getAmazonReviews(url, maxReviews) {
  const client = new Apify.createClient({ token: process.env.APIFY_API_KEY });

  const runInput = {
    productUrls: [{ url }],
    maxReviews,
    proxyConfiguration: { useApifyProxy: true },
    extendedOutputFunction: "($) => { return {} }",
  };

  const run = await client.actor("junglee/amazon-reviews-scraper").call({ runInput });

  const dataset = await client.dataset(run.defaultDatasetId).listItems();
  const reviews = dataset.items.map((item) => ({
    ratingScore: item.ratingScore || "N/A",
    reviewTitle: item.reviewTitle || "N/A",
    reviewReaction: item.reviewReaction || "N/A",
    reviewDescription: item.reviewDescription || "N/A",
  }));

  return reviews;
}

(async () => {
  const url = "https://www.amazon.com/example-product-url";
  const maxReviews = 100;

  const reviews = await getAmazonReviews(url, maxReviews);

  if (reviews.length > 0) {
    let totalScore = 0;

    for (const review of reviews) {
      const buyScore = await generateBuyScore(review);
      totalScore += buyScore;

      console.log(`Stars: ${review.ratingScore}`);
      console.log(`Title: ${review.reviewTitle}`);
      console.log(`Helpful: ${review.reviewReaction}`);
      console.log(`Description: ${review.reviewDescription}`);
      console.log(`Buy Score: ${buyScore}`);
      console.log("---");
    }

    const averageBuyScore = totalScore / reviews.length;
    console.log(`Average Buy Score: ${averageBuyScore.toFixed(2)}`);
  } else {
    console.log("No reviews found.");
  }
})();
