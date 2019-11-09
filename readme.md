# Discern
A one line script to set up google analytics and [segment](https://segment.com/)
tracking for all events on your website. Setup is a single copy & paste.

## Setup

First make sure you've installed either google analytics or segment on your site's `<head>` tag. Then:

Paste the following lines below the google analytics / segment tag and above the closing `</head>` tag on the webpage where you wish to track events.
Note that you would have to place it in every page you would want to track (same as with google analytics / segment).

```
<script src="https://cdn.jsdelivr.net/gh/urimerhav/discern/js/discern.js">

<script>
    const discern = new Discern();
</script>
```

That's it! All important events will now be automatically tracked and sent to your analytics solution.
