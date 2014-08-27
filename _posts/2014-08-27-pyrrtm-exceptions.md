---
title: Raising exceptions from legacy FORTRAN code
layout: post
---

When writing [pyrrtm](/pyrrtm), I wrapped a large FORTRAN code using a cython interface. The original FORTRAN code was written as a standalone program, taking ASCII input files and producing ASCII output files, and so errors in the FORTRAN code were simply coded to print an error message and terminate the program. For example, using the following code to detect an error is common throughout the code base:

{% highlight fortran %}
      IF (<some condition>) STOP "Error message here..."
{% endhighlight %}

Unfortunately, when wrapped using cython, such code kills the python process, and this is not really satisfactory.

In order to handle these errors gracefully, we need to do these things:
1. We must stop executing the FORTRAN code and return to python. We cannot just allow execution to proceed, as we could walk into a segfault doing this.
2. We need to save the error message.
3. We must be able to call the FORTRAN code again after the error.

To accomplish these things, we have to replace the ``STOP`` command with some subroutine that can carry out various operations. (We can't just use ``atexit`` to set up a callback on ``STOP`` as the program must continue to terminate after such a call.) Therefore, the first challenge is to write a script that is able to replace
{% highlight fortran %}
      IF (<some condition>) STOP "Error message here..."
{% endhighlight %}
with
{% highlight fortran %}
      IF (<some condition>) CALL RRTMERR("Error message here...")
{% endhighlight %}
where ``RRTMERR`` is some subroutine that will handle the error. Due to the intricacies of FORTRAN 77's fixed column width and formatting, this is quite annoying to write (lots of corner cases) but can be made to work throughout the code base. I ended up writing a script that could handle about 95% of all occurrences of ``STOP``, and then fixing the few exceptional cases by hand. Once this is complete, we just have to understand how to write the ``RRTMERR`` subroutine.

To address point 1 above, it is clear that the ``RRTMERR`` subroutine cannot return execution to the FORTRAN code. One way to achieve this is to use ``setjmp`` and ``longjmp`` in C, so I constructed a thin C wrapper that would just call the FORTRAN commands, but wrap them in a ``setjmp`` statement. It returns an error code depending on whether ``longjmp`` has been called:

{% highlight C++ %}
jmp_buf rrtmerr_jump;

int rrtmsafe_run(...) {
  if (! setjmp(rrtmerr_jump) ) {
    // run call our fortran subroutines to perform task
    ...
    // return 0 to indicate success.
    return 0;
  }
  // if we get to here, there was an error.
  return 1;
}
{% endhighlight %}

The C wrapper also provides the ``RRTMERR`` subroutine, which in C is called the ``rrtmerr_`` function (for the GNU compilers). This function simply saves the message as a global variable (which will be accessed by cython), and then calls ``longjmp``. The ``rrtmerr_`` function is called explicitly with the length of the string, as FORTRAN does not null-terminate the string for us.

{% highlight C++ %}
void rrtmerr_(char * message, int * length) {
  // this function will be called from fortran
  int n = (int) *length;
  int i;
  // copy the message string into global variable rrtmerr_message
  for (i=0; i<n; i++) {
    rrtmerr_message[i] = message[i];
  }
  rrtmerr_message[i] = '\0';
  // return control to run_rrtm.
  longjmp(rrtmerr_jump, 1);
}
{% endhighlight %}

This solution now gracefully allows errors to be handled in FORTRAN and control returned to cython and python. The cython code simply interprets the return code of ``rrtmsafe_run`` and raises an exception if necessary.
