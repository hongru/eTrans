eTrans
======

a Simple and Low coupling Stage Trans Tool


Usage
=====

<pre>
&lt;script src="/dist/0.0.1/etrans.js"&gt;&lt;/script&gt;
</pre>
or
<pre>
var ETrans = require('/dist/0.0.1/etrans.js');
</pre>
Then,
<pre>
var et = new ETrans({
            '^main': '#main_wrapper',
            '^search': '#search_wrapper',
            '^item': '#item_wrapper',
            '^compare': '#compare_wrapper'
        }, {
            driveByHash: true,
            backward: ['^item > *', '* > ^main', '^compare > *']
        });
</pre>

Example
=====

http://h5.m.etao.com
