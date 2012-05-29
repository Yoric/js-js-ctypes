# js-js-ctypes

An ongoing experiment to reimplement parts of js-ctypes in JS.

# Why?

js-ctypes is a very nice tool that lets JavaScript authors place
direct calls to C functions. This comes in very handy to interact with
existing native libraries.

Unfortunately, js-ctypes suffers from:
- an implementation that is difficult to understand and even more
   difficult to extend;
- implementation choices that make it impossible to add features
   without recompiling js-ctypes and everything that depends upon
   it (say, Firefox, for instance) - so, in particular, if you
   are programming for Windows, do not expect to be able to use
   a type called `DWORD`;
- lack of JIT-ability - the critical path of js-ctypes is very generic
   code. While a given C function will always use one specific path
   through that code, any call to that function needs to get through
   the generic code, its dynamic type-casts, etc.;
- lack of JIT-ability, continued - while everybody agrees that it would
   be nice to somehow merge js-ctypes and the JIT, the complexity of the
   code makes this quite difficult to envision.

This project is an experiment to try and improve the situation on all fronts.

I aim to extract as much code as possible of js-ctypes and reimplement it
in JavaScript. The hopes are the following:
- obtain code that is much easier to read and extend;
- ability to define new types and new constructors that interact smoothly
  with js-ctypes even though they are not part of its core;
- JIT-able function calls;
- paving the way to complete JIT-ability of the code, with a few very simple
  primitives.

# Current status

This is an early experiment.
