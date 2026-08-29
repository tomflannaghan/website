flannaghan.com
==============

The Jekyll source for <https://flannaghan.com> — a personal site with a blog, a
few interactive tools, publications and talks, and a cycling section with
mapped routes and elevation profiles.


Build requirements
------------------

Firstly, the system packages:

```
sudo dnf install jekyll gpsbabel python3-gpxpy python3-numpy python3-scipy python3-matplotlib
```

Then the ruby packages:

```
gem install gpx
gem install jekyll-sitemap
```

`gpsbabel` and the Python packages are needed by the cycling route plugin (see
below), which runs on every build — the build fails without them. The plugin
shells out to `python`, not `python3`, so that name has to resolve.


Building and publishing
-----------------------

Preview locally with live reload on <http://localhost:4000>:

```
jekyll serve
```

To build and push to production:

```
./build_and_publish.sh
```

That does a `jekyll clean && jekyll build`, then rsyncs `_site/` to the
`lightsail` host (configure it in `~/.ssh/config`).

**The rsync does not use `--delete`.** Anything published once stays on the
server forever, even after it is deleted here. If you remove or rename a page,
delete the old file on the server by hand as well, or it will keep serving at
its old URL.

Equally, anything that lands in `_site` gets served publicly at the site root.
When adding files to the top level of the repo, check whether they belong in the
`exclude` list in `_config.yml`.


Layout
------

| Path | What it is |
| --- | --- |
| `_posts/` | Blog posts, `YYYY-MM-DD-slug.md` or `.html`. |
| `_layouts/` | `default`, `post`, `tag_list`, and `bikeroute` for cycling routes. |
| `_includes/` | Page head and the main navigation bar. |
| `_plugins/` | Custom Jekyll plugins, see below. |
| `_data/` | `navigation.yml` drives the menu; also publications and talks. |
| `cycling/` | Cycling section — routes, KML sources, generated GPX and elevation plots. |
| `assets/`, `css/`, `js/` | Static files, including vendored Bootstrap and Plotly. |
| `test/` | Scratch pages, published but unlinked. |

Posts are listed on `/postlist_full.html`. Adding `tags: [tool]` to a post also
lists it on `/postlist_tools.html`; the `tag_list` layout generates a page per
tag this way. Posts under the `cycling` category are kept out of the main blog
list.

The menu is built from `_data/navigation.yml`, which is just a list of URLs —
each entry picks up its label from the target page's `menutitle` or `title`.


Plugins
-------

- `procroute.rb` — the cycling route pipeline. For each page under
  `cycling/routes/`, it reads the matching KML in `cycling/kml/`, converts and
  simplifies it with `gpsbabel`, and writes a GPX file. It then pipes the route
  data to `procroute.py`, which uses numpy/scipy/matplotlib to render the
  elevation profile images into `cycling/alt/`. Both source directories are
  excluded from the build output.
- `strip.rb` — a `{% strip %}` Liquid block that collapses blank lines, used to
  keep the generated nav markup tidy.
- `experimental.py` — a scratch script for elevation experiments. Not part of
  the build.


Notes
-----

Comments were removed in 2017 when the third-party service behind them
(pooleapp) shut down. The 2015 post about setting them up is kept as a matter of
record, but none of the machinery remains.
