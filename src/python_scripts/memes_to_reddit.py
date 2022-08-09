import os
import sys
import praw
import requests
import argparse


def create_post(post_title: str, image_link: str):
	"""Creer un post dans le subreddit r/francememes_.
	
	Parametres:
		post_title	Le titre du post.
		image_link	Le lien de l'image qui sera integree au post."""

	reddit = praw.Reddit(
		client_id=os.environ["REDDIT_APP_ID"],
		client_secret=os.environ["REDDIT_APP_SECRET"],
		password=os.environ["REDDIT_PASSWORD"],
		username=os.environ["REDDIT_USERNAME"],
		user_agent=os.environ["REDDIT_USER_AGENT"],
	)

	image_name = download_image(image_link)
	if not image_name:
		return

	subreddit = reddit.subreddit("francememes_")
	subreddit.submit_image(
		title=post_title,
		image_path="python_scripts/" + image_name
	)
	os.remove("python_scripts/" + image_name)


def download_image(image_link):
	image_name = image_link.split("/")
	image_name = image_name[len(image_name) - 1]

	with requests.get(image_link) as req:
		if req.status_code == 200:
			with open("python_scripts/" + image_name, "wb") as image:
				image.write(req.content)
			return image_name

	return None


if __name__ == "__main__":
	parser = argparse.ArgumentParser(
		description="Creer un poste reddit avec un titre et une image.")
	parser.add_argument("post_title", type=str, nargs=1,
		help="Le titre du post qui sera cree.")
	parser.add_argument("image_link", type=str, nargs=1,
		help="Le lien de l'image qui sera integree au post.")
	
	args = parser.parse_args()
	create_post(args.post_title[0], args.image_link[0])