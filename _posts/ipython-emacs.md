---
name: ipython-emacs
date: 29/08/13
keywords:
 - emacs
 - python
 - programming
parent: postlist_full
title: ipython and different emacs versions
template: post
---

I use `ipython` and `emacs` to do almost all of my data analysis work,
and I use them across many different machines and systems. Getting
`ipython` to work nicely in emacs across multiple versions is a bit
challenging, especially in the older versions.

### Emacs 21

I still use some machines running Scientific Linux 5 (RHEL 5), with
`emacs 21.4.1`. In this version of `emacs`, the easiest way to get
`ipython` to work is my tricking the standard builtin `python.el` mode
into thinking it is seeing a normal `python` interpretter. We can do
this by using the `ipython --classic` flag. The following `.emacs`
snippet does this:

    --- language: cl ---
	(setq py-python-command "ipython")
    (setq py-python-command-args '("-i" "--classic" "--pylab"))

We then get a working `ipython` prompt with `pylab` support but do not
get autocomplete or any of the other keyboard shortcuts. Executing
regions does work however, so the resulting interpreter is perfectly
useable.

### Emacs 23

Some of the machines I use run Scientific Linux 6 (RHEL 6), which uses
`emacs 23.1.1`. The builtin `python.el` mode will no longer accept the
hack used above for `emacs 21`, and also cannot easily (to my
knowledge) be customised to accept `ipython`. Therefore, we must
install the external
[`python-mode.el`](http://svn.python.org/projects/python/trunk/Misc/python-mode.el)
and
[`ipython.el`](https://raw.github.com/ipython/ipython/master/docs/emacs/ipython.el)
to get a functioning `ipython` interpreter. The key here is to get
these files from the standard and most up to date sources (the ones I
just linked to). There are loads of other versions of both files lying
around online that may or may not work.

The `.emacs` snippet required is then

    --- language: cl ---
    (require 'python-mode)
    (require 'ipython)
    (setq-default py-python-command-args '("--pylab" "--colors" "LightBG"))

`ipython.el` does a great job of supporting lots of `ipython`
features, so this setup works very nicely.

### Emacs 24

`emacs 24.3` features a much-improved built in `python.el` with
builtin `ipython` support in the `python.el` package. This updated
package is also compatible with `emacs 24.x`, and is included by
adding
[this copy](http://repo.or.cz/w/emacs.git/blob_plain/refs/heads/emacs-24:/lisp/progmodes/python.el)
of `python.el` to your load path.  `ipython` can then be activated
simply by using this code in your `.emacs`:

    --- language: cl ---
    (require 'python)
    (setq python-shell-interpreter "ipython")
    (setq python-shell-interpreter-args "--pylab")

