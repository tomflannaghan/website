---
name: synctex-f17
date: 31/01/13
keywords:
 - emacs
 - programming
title: Synctex, emacs and okular on Fedora 17
parent: postlist_full
template: post
---

Synctex is a feature available in the more recent LaTeX distributions
that embeds links to locations in the source code (e.g. file name and
line number) at the corresponding locations in a pdf file. When viewed
with a compatible viewer and editor, we can automatically scroll the
viewer to the point in the pdf corresponding to the location of the
cursor in the editor, and vice versa.  Very handy if you are editing a
long document (e.g. a thesis or paper)! In theory, emacs and Okular is
an example of a compatible editor and viewer combination.

In TeX Live 2007 (the distribution installed by default on Fedora 17
using `yum`), synctex is not supported so all this goodness does not
work. To get things working, we need to update to the more modern TeX
Live 2012. This can be easily done by
[installing directly from TeX Live](http://www.tug.org/texlive/quickinstall.html). I
installed TeX Live 2012 to `/opt/texlive/2012` as this is a
distribution-independant location (the default is in `/usr/` and might
clash with with any `yum` installation.) Remember to uninstall any
other `latex` distributions, and add the newly installed location to
the `PATH` environment variable.

Once this is done, some configuration code needs to go into the
`.emacs` file:

    --- language: cl ---
    (add-hook 'LaTeX-mode-hook
              (lambda()
               (add-to-list 'TeX-expand-list
                            '("%(dir)" 
                              (lambda () default-directory)))))
    (add-hook 'LaTeX-mode-hook 'TeX-source-correlate-mode)
    (setq TeX-view-program-list 
          '(("okular" "okular --unique %o#src:%n%(dir)./%b")))
    (setq TeX-source-correlate-method 'synctex)

Note that this snippet is not compatible with TeX Live 2011 even
though TeX Live 2011 also supports synctex. This is because there is a
difference in the file path formatting used.

Okular also needs some set up. In `Settings>Configure
Okular...>Editor` select `emacs client` as the editor. Finally restart
emacs. With that we are done. LaTeX files need to be compiled from
within AUCTEX for synctex to work.

If everything works, Okular will automatically scroll to the location
of the emacs cursor on C-c C-v. Shift-left click in Okular should
perform the reverse look-up and scroll to the relevant line in the
source in emacs. Lovely!

I'm using emacs 24.1.1, Okular 0.15.5 and AUCTEX 11.86.
