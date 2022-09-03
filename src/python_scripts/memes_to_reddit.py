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


def post_link(post_title: str, media_link: str):
	subreddit = get_api_connection()
	subreddit.submit(
		title=post_title,
		url=media_link
	)


def post_media(post_title: str, media_link: str, media_type: str):
	subreddit = get_api_connection()

	media_name = download_media(media_link)
	if not media_name or "gif" in media_type:
		return

	if "image" in media_type:
		subreddit.submit_image(
			title=post_title,
			image_path=media_name
		)
	else:
		subreddit.submit_video(
			title=post_title,
			video_path=media_name
		)
	os.remove(media_name)


def download_media(media_link):
	media_name = media_link.split("/")
	media_name = "python_scripts/" + media_name[len(media_name) - 1]

	with requests.get(media_link) as req:
		if req.status_code == 200:
			with open(media_name, "wb") as image:
				image.write(req.content)
			return media_name

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

	if "lien" in args.media_type[0]:
		post_link(args.post_title[0], args.media_link[0])
	else:
		post_media(args.post_title[0], args.media_link[0], args.media_type[0])