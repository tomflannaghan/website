---
tags:
 - emacs
 - latex
 - programming
title: Custom command highlighting in emacs
layout: post
---

Some commands are not highlighted well in AUCTEX; these commands are
commands which AUCTEX does not know about. To do highlighting
correctly, AUCTEX needs to know the number and type of arguments
(e.g. `[...]` or `{...}`) that a given command takes before it can
highlight the arguments correctly. There is a relatively simple way to
add your own commands with specified arguments, and this chunk of
.emacs code does the job:

{% highlight cl %}
(setq font-latex-match-reference-keywords
          '(("citep" "[{")
           ("citet" "[{")
           ("degrees" "")
           ("units" "{") ))
{% endhighlight %}

This is a simple list of commands and argument specifiers. See the
AUCTEX docs for the full information on these argument
specifiers. However, what if we want to highlight some commands
differently? For example, I use a command `\fixme` often to indicate
things which need fixing, and I would like the command and it's
arguments to be highlighted very obviously in red. Getting the command
highlighted turns out to be fairly easy:

{% highlight cl %}
(setq font-latex-match-warning-keywords
      '(("fixme" "{") ))
{% endhighlight %}

This does not however highlight the argument. To do this, we need to
use a relatively complicated thing called a custom keyword class which
is buried in the docs. These give you the freedom to customize the
rendering of the arguments to any command. The code needed to
highlight the arguments to fixme is

{% highlight cl %}
(setq font-latex-user-keyword-classes
          '(("my-warning-commands"
                (("fixme" "{"))
                (:foreground "red")
                command)))
{% endhighlight %}

This, in conjunction with the previous snippet is sufficient to
highlight both the argument and command in a nice obvious red.

Caveat: The use of both of these snippets of code together should
probably be considered a hack, as we are giving the same command two
"types", and because warning keywords are not expected to have
arguments (they are treated differently from other command types.)
This method may not work in other versions of AUCTEX, as I doubt it
was designed with this use in mind, but works like a treat for me!! If
it breaks in the future, I will remove the former snippet and settle
for a red argument.
