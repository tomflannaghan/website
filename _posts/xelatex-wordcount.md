---
name: xelatex-wordcount
date: 21/08/13
keywords:
 - latex
 - programming
title: Word count in XeLatex
parent: postlist_full
template: post
---

A while ago I switched to XeLatex from Latex as it can do some amazing
things. One particularly cool thing is word counting from within the
document itself. This is great for paper abstracts! I got the code
from
[here](http://robert.orzanna.de/2012/06/xelatex-word-count-inside-document.html)
(or possibly somewhere else with similar code -- it was a while ago!)
and tweaked it a bit to produce my `wordcounter` environment:

    --- language: latex ---
    {% raw %}
    \usepackage{xesearch}
    \usepackage{fontspec}
    \newcounter{words}
    \makeatletter

    %% word counting environment
    \newenvironment{wordcounter}{%
    \endgroup
      \setcounter{words}{0}%
    \expandafter\ifx\csname wordcount@xs@searchlist\endcsname\relax
      \let\wordcount@xs@searchlist\undefined
      \SearchList!{wordcount}{\stepcounter{words}}
        {a?,b?,c?,d?,e?,f?,g?,h?,i?,j?,k?,l?,m?,
        n?,o?,p?,q?,r?,s?,t?,u?,v?,w?,x?,y?,z?}
      \UndoBoundary{'}%
      \SearchOrder{p;}%
      \else
       \expandafter\StartSearching
      \fi}{%
      \StopSearching
    
       \hspace*{\fill}
       {word count: \arabic{words} words}%
    \begingroup\expandafter\def\csname @currenvir\endcsname{wordcounter}%
    }
    \makeatother
    {% endraw %}

Usage is very simple -- just wrap the part of the document that needs
to be word-counted in the `wordcounter` environment, and a message
will be inserted into the document after the text giving the word
count. For example

    --- language: latex ---
    {% raw %}
    \begin{wordcounter}
        blah blah blah blah blah
    \end{wordcounter}
    {% endraw %}
