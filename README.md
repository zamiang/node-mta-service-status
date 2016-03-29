[![Build Status](https://semaphoreci.com/api/v1/zamiang/node-mta-service-status/branches/master/badge.svg)](https://semaphoreci.com/zamiang/node-mta-service-status)

# MTA Service Status

This project aims to make it easy to query the MTA service status file.

Currently, it allows you to query this crazy file by individual transit line and get back sane json.

``` javascript
var MTA = import('mta-service-status');

MTA.getServiceStatus('subway', 'C').then(function(result) {
    console.log(result);
})
/**
  result = {
    name: 'ACE'
    status: 'GOOD SERVICE'
    html: '',
    date: '03/29/2016'
    time: '11:23AM'
  };
**/

```

## Future goals

### Parse the html of service advisories to return real JSON

Go from
``` html
                  &lt;span class="TitleServiceChange" &gt;Service Change&lt;/span&gt;
                  &lt;span class="DateStyle"&gt;
                  &amp;nbsp;Posted:&amp;nbsp;03/29/2016&amp;nbsp;10:18AM
                  &lt;/span&gt;
                  &lt;br/&gt;
                  &lt;br/&gt;
                &lt;P&gt;&lt;STRONG&gt;Bx4A&lt;/STRONG&gt; westbound buses are detoured due to DEP work on Bergen Av between Westchester Av and E 149 St. &lt;/P&gt;
&lt;P&gt;Detour is as follows:&lt;/P&gt;
&lt;P&gt;&lt;STRONG&gt;Westbound&lt;/STRONG&gt;: Via E 149 St, bypass Bergen Av, right on Third Av, right on Westchester Av, take stand at far side of Bergen Av and terminate. &lt;/P&gt;
&lt;P&gt;Allow additional travel time. &lt;/P&gt;
```

To something like:
``` json
"warning": {
  "title": "Service Change",
  "date": "Posted: 03/29/201610:18AM"
  "textLines": [
    "Bx4A westbound buses are detoured due to DEP work on Bergen Av between Westchester Av and E 149 St.",
    "Detour is as follows:"
  ]
}
```
