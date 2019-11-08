# Discern
A one line script to set up google analytics and [segment](https://segment.com/) 
tracking for all events on your website. No coding require other than a pasted snippet.

## Setup

First make sure you've installed either google analytics or segment on your site's `<head>` tag. Then:
 
 1. Paste the following lines right before the closing `</body>` tag on the webpage where you wish to track events.

```
<script src="https://cdn.jsdelivr.net/gh/urimerhav/discern/js/discern.js">

<script>
    const discern = new Discern("YOUR_API_KEY");
</script>
``` 

That's it! All important events will now be automatically tracked and sent to your analytic solution.