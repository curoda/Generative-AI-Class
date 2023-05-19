# Generative-AI-Class
Most of the files in this repository are related to a chrome extension we created during an AIPM course on Generative AI:
 - background.js
 - contentscripti.js
 - manifest.json
 - popup.html
 - popup.js
 
 You'll need your own OpenAI API key and insert it into popup.js.
 
 The intention of the chrome extension is the summarize product and review data using the OpenAI API, to help Amazon shoppers make buying decisions more quickly.
 
 Additionally, the Streamlit-Get-Reviews.py and requirements.txt files are for a Streamlit.io implementation that focused on scraping product reviews, and summarizing them.  This uses Apify and an actor called "Amazon Review Scraper" in order to get reviews.  In addition to your OpenAI API key, you'll also need an Apify API key, and have the actor configured for your profile.
