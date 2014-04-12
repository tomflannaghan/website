---
tags:
 - gnome
 - linux
 - programming
title: Keyboard shortcuts and focus
layout: post
---

I like having custom keyboard shortcuts to launch applications (mainly
terminals, emacs, and Google Chrome.) For `emacsclient` and the
`gnome-terminal`, it makes sense to open a new window each time the
keyboard shortcut is keyed. However, I find it annoying when a new
Chrome window opens each time I key the shortcut. Often, I really
would rather switch to the existing Chrome window and open a new
tab. With multiple desktops (especially in Gnome 3) I find that I end
up with Chrome windows on all of my desktops -- quite annoying!

This script deals with this problem:

{% highlight bash %}
#!/usr/bin/bash

test=`wmctrl -l | grep "$1" `
if [ -z "$test" ] ; then
    $2
fi
wmctrl -R "$1"
{% endhighlight %}
	
I have named this `run_or_focus` as it checks to see if the application
has any open windows; if it does not, it will execute the application,
and if it does, the window will be moved to the current desktop and be
given focus. The script takes two arguments, the first being a search
string which appears in all window titles belonging to the application
windows. The second is the application name.

The keyboard shortcut command for Google Chrome is then

{% highlight bash %}
run_or_focus "Google Chrome" google-chrome
{% endhighlight %}

This works like a treat.
