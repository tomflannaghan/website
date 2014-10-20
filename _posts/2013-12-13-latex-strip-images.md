---
title: Processing images individually in Latex
layout: post
tags:
 - latex
---

When publishing a paper, it is often required to generate a single file for each image in the manuscript, which can be rather technically difficult when complicated figures are composed of separate plots or additional latex annotations have been added using `overpic` or similar. An example of a particularly complicated figure from a recent paper is

{% highlight latex %}
\begin{figure}
  \begin{overpic}[width=39pc]{av_tt_DJF_JJA}
    \put(4,30){a) i.}
    \put(46,30){ii.}
    \put(36,20){\textsf{\LARGE A}}
    \put(8,20){\textsf{\LARGE B}}
    \put(16,20){\textsf{\LARGE C}}
  \end{overpic}
  \begin{overpic}[width=39pc]{av_acc_DJF_JJA}
    \put(4,30){b) i.}
    \put(46,30){ii.}
  \end{overpic}
  \caption{  .... }
\end{figure}
{% endhighlight %}

This figure would need stitching together somehow before submission. Previously I had done this by hand in Inkscape but for this paper I decided to try and write a script to automate things. The following script automatically locates figures in a latex document (here called `mixing.tex`) and renders them as separate latex documents using `pdflatex`. It then crops the padding using `gs` resulting in a sequence of `pdf` image files named `figure01.pdf`, `figure02.pdf`, etc. A new latex document is also produced (here `mixing_pub.tex`) where suitable `\includegraphics{figure01}` etc replace the figure latex in the original document.

{% highlight python %}
import re
import os

def convert_image(content, out, padding=0):
    latex = r'''\documentclass[12pt]{article}
    \usepackage{overpic}
    \usepackage{color}
    \usepackage[top=1in,bottom=1in,left=1in,right=1in]{geometry}
    \begin{document}
    \pagestyle{empty}
    \begin{figure}
    \noindent %s
    \end{figure}
    \end{document}
''' % content
    open('temp.tex', 'w').write(latex)
    os.system('pdflatex temp.tex')
    os.system('gs -q -dBATCH -dNOPAUSE -sDEVICE=bbox temp.pdf 2>&1 '
              '| grep -v HiRes > temp.bb')
    bb = [int(s) for s in open('temp.bb', 'r').read().split()[1:5]]
    print bb
    l, t, r, b = bb
    l -= padding
    r += padding
    t -= padding
    b += padding
    os.system(('gs '
               '-o temp.cropped.pdf '
               '-sDEVICE=pdfwrite '
               '-c "[/CropBox [%d %d %d %d] /PAGES pdfmark" '
               '-f temp.pdf') % (l, t, r, b))
    os.system('mv temp.cropped.pdf %s' % out)

class Replacer:
    def __init__(self):
        self.count = 0

    def replacement(self, mo):
        self.count += 1
        content = mo.group(2)
        filename = 'publication-ready/figure%0.2d.pdf' % self.count
        print filename
        convert_image(content, filename, padding=4)
        return r"\begin{figure}\includegraphics{" \
            + os.path.basename(filename) + "}\caption"


data = open('mixing.tex', 'r').read()
rep = Replacer()
newdata = re.sub(r"\\begin{figure}(\[.*?\])?(.*?)\\caption",
                 rep.replacement, data, 
                 flags=re.MULTILINE|re.DOTALL)
open('mixing-pub.tex', 'r').write()
{% endhighlight %}

This setup works well, and cuts out a lot of otherwise tedious work. It requires ghostscript and should work with any latex distribution (I'm using TexLive 2012 on Fedora 17.) You might need to add stuff to the preamble in the `convert_image` function if you use other packages.
