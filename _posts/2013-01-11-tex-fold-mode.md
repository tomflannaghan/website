---
tags:
 - emacs
 - latex
 - programming
title: TeX-fold-mode in AUCTEX and "auto-folding"
layout: post
---

[TeX-fold-mode](http://www.gnu.org/software/auctex/manual/auctex/Folding.html)
is a minor mode which is part of
[AUCTEX](http://www.gnu.org/software/auctex/), and automatically hides
a lot of the latex formatting commands. For example, `\alpha` is
rendered using an alpha character, and references are shortened to
`[r]`. Here's an example:

<div class="thumbnail">
<img alt="Tex Example" src="/assets/tex-fold-mode-example.png" />
</div>

This gives a much cleaner feel when writing. Adding

{% highlight cl %}
(add-hook 'LaTeX-mode 
          (lambda ()
            (TeX-fold-mode 1)
            (add-hook 'find-file-hook 'TeX-fold-buffer t t)))
{% endhighlight %}

to your `.emacs` will load the mode automatically and fold the whole
buffer when you load a latex file. However, when typing, any new stuff
won't appear "folded". To "re-fold" a paragraph, the command
TeX-fold-paragraph must be used (shortcut `C-c C-o C-p`), which is a
bit tedious.

Instead, it would be great if things would fold automatically. Calling
`TeX-fold-paragraph` after every character insert event would slow
emacs down to a crawl, so the approach that I use is to automatically
call it when either `$` or `}` are entered (typically ending an
expression which should be folded). The code required for this adds a
local hook which detects this change (the local part is important as
we don't want this hook applying to other buffers) is
{% highlight cl %}
(add-hook 'LaTeX-mode-hook 
      (lambda () 
        (TeX-fold-mode 1)
        (add-hook 'find-file-hook 'TeX-fold-buffer t t)
        (add-hook 'after-change-functions 
              (lambda (start end oldlen) 
                (when (= (- end start) 1)
                  (let ((char-point 
                                 (buffer-substring-no-properties 
                                  start end)))
                   (when (or (string= char-point "}")
                         (string= char-point "$"))
                    (TeX-fold-paragraph)))))
               t t)))
{% endhighlight %}

This does not slow emacs down noticeably on my machine while keeping
folding up to date. Typing a row of `$` or `}` characters becomes very
laggy but I don't have to do that very often!
