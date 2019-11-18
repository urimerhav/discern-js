# Discern
A one line script to set up Google Analytics and [Segment](https://segment.com/) tracking for all events on your website. Setup is a single copy & paste.

## Installation

### Prerequisites

First make sure you've installed either Google Analytics or Segment on your site's `<head>` tag. See:

* [Google Analytics Install Instructions](https://support.google.com/analytics/answer/1008015?hl=en)
* [Segment Install Instructions](https://segment.com/docs/sources/website/analytics.js/quickstart/) - only follow step 1, Discren will do the rest. 


### Setup

Once you've installed either Google Analytics or Segment on your site's `<head>` tag, then:

Paste the following lines below the Google Analytics / Segment tag and above the closing `</head>` tag on the webpage where you wish to track events.
Note that you would have to place it on every page you want to track (same as with Google Analytics / Segment).

```
<script src="https://cdn.jsdelivr.net/gh/urimerhav/discern/js/discern.js"></script>
<script>const discern = new Discern();</script>
```


That's it! All important events will now be automatically tracked and sent to your analytics solution. Note this may 
take up to 24 hours while Discern analyzes user behavior to determine what events are important enough to track.