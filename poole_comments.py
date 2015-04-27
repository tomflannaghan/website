import bleach
import json
import markdown
import urllib2
import yaml


URL = "http://pooleapp.com/data/789c025c-0e07-45ac-aa03-1465fcf25e02.json"
OUTPUT_YAML = "_data/comments.yml"

def process_comment(comment):
    '''Comment should be a dictionary. Returns a new dictionary with
       fields ready for publication to the website. Return None if
       nothing

    '''
    allowed_tags = bleach.ALLOWED_TAGS + ['p']
    comment_html = bleach.clean(markdown.markdown(comment['comment']),
                                allowed_tags, strip=True)
    return {'name': str(comment['name']),
            'comment': str(comment_html),
            'path': str(comment['path'])}


def main():
    # fetch from poole
    raw_data = urllib2.urlopen(URL).read()

    # decode the json
    comments = json.loads(raw_data)['sessions']

    # process the comments
    processed_comments = []
    for comment in comments:
        try:
            processed_comments.append(process_comment(comment))
        except Exception as exception:
            print("Exception {} raised processing comment {}"
                  .format(exception, comment))

    # save to yaml
    with open(OUTPUT_YAML, "w") as f:
        yaml.dump(processed_comments, f)

if __name__ == "__main__":
    main()
