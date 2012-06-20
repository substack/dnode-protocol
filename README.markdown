dnode-protocol
==============

This module implements the dnode protocol in a reusable form that is presently
used for both the server-side and browser-side dnode code.

[Read about the protocol itself here.](https://github.com/substack/dnode-protocol/blob/master/doc/protocol.markdown)

[![build status](https://secure.travis-ci.org/substack/dnode-protocol.png)](http://travis-ci.org/substack/dnode-protocol)

example
=======

``` js
```

methods
=======

``` js
var protocol = require('dnode-protocol')
```

var proto = protocol(cons, localRef=[])
---------------------------------------

Create a new protocol object with a constructor `cons`.



other languages
===============

These libraries implement the dnode protocol too so you can make RPC calls
between scripts written in different languages.

* [dnode-perl](http://github.com/substack/dnode-perl)
* [dnode-ruby](http://github.com/substack/dnode-ruby)

There's a python one in the works too at
* [dnode-python](https://github.com/jesusabdullah/dnode-python)
but it's not finished yet.
