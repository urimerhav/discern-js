# Discern
A one line script to set up google analytics and [segment](https://segment.com/) 
tracking for all events on your website. Setup is a single copy & paste. 

## Installation

### Prerequisites

First make sure you've installed either google analytics or segment on your site's `<head>` tag. See:

* [Google Analytics Install Instructions](https://support.google.com/analytics/answer/1008015?hl=en)
* [Segment Install Instructions](https://segment.com/docs/sources/website/analytics.js/quickstart/) - only follow step 1, Discren will do the rest. 


### Setup

 
 Paste the following lines right before the closing `</head>` tag on the webpage where you wish to track events, 
 directly below your analytics code that you set up above. 

```
<script src="https://cdn.jsdelivr.net/gh/urimerhav/discern/js/discern.js">

<script>
    const discern = new Discern();
</script>
``` 


That's it! All important events will now be automatically tracked and sent to your analytics solution. Note this may 
take up to 24 hours while we Discern analyzes user behavior to determine what events are important enough to track. 

