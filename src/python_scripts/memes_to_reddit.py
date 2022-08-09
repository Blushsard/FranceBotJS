import os
import praw
import requests
import argparse


def get_api_connection():
	return praw.Reddit(
		client_id=os.environ["REDDIT_APP_ID"],
		client_secret=os.environ["REDDIT_APP_SECRET"],
		password=os.environ["REDDIT_PASSWORD"],
		username=os.environ["REDDIT_USERNAME"],
		user_agent=os.environ["REDDIT_USER_AGENT"],
	).subreddit("francememes_")


def post_image(post_title: str, media_link: str):
	subreddit = get_api_connection()

	image_name = download_media(media_link)
	if not image_name:
		return

	subreddit.submit_image(
		title=post_title,
		image_path="python_scripts/" + image_name
	)
	os.remove("python_scripts/" + image_name)


def post_link(post_title: str, media_link: str):
	subreddit = get_api_connection()
	subreddit.submit(
		title=post_title,
		url=media_link
	)


def post_video(post_title: str, media_link: str):
	subreddit = get_api_connection()


def download_media(media_link):
	image_name = media_link.split("/")
	image_name = image_name[len(image_name) - 1]

	with requests.get(media_link) as req:
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
	parser.add_argument("media_link", type=str, nargs=1,
		help="Le lien du media qui sera integree au post.")
	parser.add_argument("media_type", type=str, nargs=1,
		help="Le type du media.")
	
	args = parser.parse_args()

	media_type = args.media_type[0].split("/")[0]
	if media_type == "lien":
		post_link(args.post_title[0], args.media_link[0])
	elif media_type == "image":
		post_image(args.post_title[0], args.media_link[0])
	elif media_type == "video":
		post_video(args.post_title[0], args.media_link[0])