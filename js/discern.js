class Discern {
    constructor(user_api) {
        var listen_targets = this.getAnalysis();
        if (listen_targets == null) {
            this.analyze();
        }
        this.applyListeners()
    }

    getAnalysis() {
        // this will query our server for whether webpage for instruction on where to listen
        return null
    }


    analyze() {
        // This function reports the current html page to our webserver
        var bodyHtml = document.getElementsByTagName('body')[0].innerHTML;
        // we also want to expand every "relative path" resource. this is TBD.

        const Http = new XMLHttpRequest();
        const url = 'https://webhook.site/b6415650-1dfc-4c0c-87c1-be90b33ac9e5';

        Http.open("POST", url, true);
        Http.send(bodyHtml);

    }

    report_event(event, payload = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', event)
        }
        // and so report for every analytic suite..
        if (typeof analytics !== 'undefined') {
            analytics.track(event, payload)
        }
    }


    applyListeners() {
        var all_buttons = document.getElementsByTagName("button");

        for (let button of all_buttons) {
            let button_name = this.name_button(button);
            console.log(button);
            button.addEventListener('click', () => this.report_event('click_' + button_name))
        }
    }

    name_button(button) {
        if (button.id) {
            return button.id;
        }
        if (button.innerText) {
            return button.innerText;
        }
        return 'unkown_button'
    }
}

