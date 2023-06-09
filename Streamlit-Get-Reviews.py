import streamlit as st
from apify_client import ApifyClient
import os
import openai

# Set your OpenAI API key
openai.api_key = st.secrets["OPENAI_API_KEY"]

def generate_buy_score(review):
    prompt = f"Based on the following review details, generate a Buy Score between 0 and 100, where 0 means 'don't buy' and 100 means 'definitely buy':\n\nTitle: {review['reviewTitle']}\nDescription: {review['reviewDescription']}\nStars: {review['ratingScore']}\nReaction: {review['reviewReaction']}\n\nBuy Score:"

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=10,
        n=1,
        stop=None,
        temperature=0.5,
    )

    try:
        score = int(response.choices[0].text.strip())
        return min(max(score, 0), 100)  # Clamp the score between 0 and 100
    except ValueError:
        return 0  # Return a default score of 0 if there's an issue parsing the score


def get_amazon_reviews(url, max_reviews):
    # Initialize the ApifyClient with your API token
    client = ApifyClient(st.secrets["APIFY_API_KEY"])

    # Prepare the actor input
    run_input = {
        "productUrls": [{ "url": url }],
        "maxReviews": max_reviews,
        "proxyConfiguration": { "useApifyProxy": True },
        "extendedOutputFunction": "($) => { return {} }",
    }

    # Run the actor and wait for it to finish
    run = client.actor("junglee/amazon-reviews-scraper").call(run_input=run_input)

    # Fetch and print actor results from the run's dataset (if there are any)
    reviews = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        review = {
        'stars': item.get('ratingScore', 'N/A'),
        'title': item.get('reviewTitle', 'N/A'),
        'reaction': item.get('reviewReaction', 'N/A'),
        'description': item.get('reviewDescription', 'N/A')
        }
        reviews.append(item)

    return reviews

st.title("Amazon Reviews Scraper")
st.write("Enter the Amazon product URL and set the maximum number of reviews to fetch:")

url = st.text_input("Amazon product URL:", "")
max_reviews = st.number_input("Max reviews:", min_value=1, value=100)

if st.button("Fetch reviews"):
    if url:
        reviews = get_amazon_reviews(url, max_reviews)
        if reviews:
            st.write("Reviews fetched successfully!")
            # Initialize the total_score variable
            total_score = 0
            for review in reviews:
                buy_score = generate_buy_score(review)
                total_score += buy_score
                
                st.write(f"Stars: {review['ratingScore']}")
                st.write(f"Title: {review['reviewTitle']}")
                st.write(f"Helpful: {review['reviewReaction']}")
                st.write(f"Description: {review['reviewDescription']}")
                st.write(f"Buy Score: {buy_score}")
                st.write("---")
            average_buy_score = total_score / len(reviews)
            st.write(f"Average Buy Score: {average_buy_score:.2f}")
        else:
            st.write("No reviews found.")
    else:
        st.write("Please enter a valid Amazon product URL.")
