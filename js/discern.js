// Discern - automatic event reporting.

// screenshot grabber
const BACKEND_URL = 'https://discern-app.herokuapp.com'
// const BACKEND_URL = 'http://localhost:5000';
const SESSIONID = '_' + Math.random().toString(8).substr(2, 9);


class Discern {
    constructor(user_api, enableSendPageForPageView = true) {
        console.log('discern starting...')
        var self = this;

        self.completed = false;

        // run the constructor as soon as page has completed loading
        window.addEventListener('load', function () {
            self.instantiate(self, enableSendPageForPageView);
            self.completed = true
        });

        // if page didn't complete loading in X seconds, run the constructor anyway
        setTimeout(function () {
            if (!self.completed) {
                // time's up without page load - report results
                self.instantiate(self, enableSendPageForPageView);
                self.completed = true;
            }
        }, 5 * 1000);
    }


    instantiate(self, enableSendPageForPageView) {
        console.log('fetching elements from backend...')
        self.getElementsFromBackend();

        if (enableSendPageForPageView) {
            console.log('report pageviews...')
            self.sendPageView();
        }
    }

    getElementsFromBackend() {
        // Queries the backend for all elements on this page
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                applyListeners(JSON.parse(this.responseText));
            }
        };
        const url = BACKEND_URL + '/get_all_elements';
        const data = JSON.stringify(
            {
                'domain': document.location.host,
                'page': document.location.pathname
            });
        xhr.open("POST", url, true);
        xhr.send(data);
    }

    sendPageView() {
        // This function reports pageview to our webserver
        const url = BACKEND_URL + '/add_page';
        const Http = new XMLHttpRequest();

        const data = JSON.stringify(
            {
                'domain': document.location.host,
                'page': document.location.pathname,
                'session_id': SESSIONID
            });
        Http.open("POST", url, true);
        Http.send(data);

    }


}


function applyListeners(elementDicts) {
    const keys = Object.keys(elementDicts);
    for (let key of keys) {
        let elementDict = elementDicts[key];
        let elementObject = DiscernStatic.locateElement(elementDict);
        let eventAction = elementDict['action'];
        let eventCategory = elementDict['category'];
        let eventLabel = elementDict['label'];
        let eventValue = elementDict['value'];

        if ((elementObject !== null) && (typeof elementObject !== 'undefined')) {
            elementObject.addEventListener('click', () => reportEvent(eventAction, eventLabel, eventCategory))
        }
    }
}


function reportEvent(eventAction, eventLabel = null, eventCategory = 'Discern', eventValue = null) {
    // report for every analytic suite, in order of priority
    // eventAction is a mandatory input,  label and category are optional

    // segment
    if (typeof analytics !== 'undefined') {
        analytics.track(eventAction, {'category': eventCategory, 'label': eventLabel, 'value': eventValue});
    }

    // google tag manager
    // else if (typeof dataLayer !== 'undefined') {
    //     dataLayer.push({'event': eventAction, 'event_category': eventCategory, 'event_label': eventLabel});
    // }

    // google analytics (gtag version)
    else if (typeof gtag !== 'undefined') {
        gtag('event', eventAction, {'event_category': eventCategory, 'event_label': eventLabel, 'event_value': eventValue})
    }

    // google analytics (ga version)
    else if (typeof ga !== 'undefined') {
        ga('send', 'event', eventCategory, eventAction, eventLabel, eventValue);
    }
}



class DiscernStatic {
//    this contains all the static function for discern. used to avoid scope collisions with other scripts
    static locateElement(elementDict, doc = document) {
        var elementObject = null;
        if ((!("instructions" in elementDict)) || (!("action" in elementDict)) || (!("inner_text" in elementDict))) {
            return elementObject;
        }
        let elementInstruction = elementDict['instructions'];
        let eventLabel = elementDict['inner_text'];
        if (elementInstruction['id'] !== '') {
            elementObject = doc.getElementById(elementInstruction['id']);
        } else if (elementInstruction['className'] !== '') {
            let classElements = doc.getElementsByClassName(elementInstruction['className']);
            var classCounter = 0;
            var classIndex = -1;
            for (let i = 0; i < classElements.length; i++) {
                if (classElements[i].textContent === eventLabel) {
                    if (classCounter === elementInstruction['classIndex']) {
                        classIndex = i;
                        break;
                    }
                    classCounter += 1;
                }
            }
            elementObject = classElements[classIndex];
        } else if (elementInstruction['tagName'] !== '') {
            let tagElements = doc.getElementsByTagName(elementInstruction['tagName']);
            var tagCounter = 0;
            var tagIndex = -1;
            for (let i = 0; i < tagElements.length; i++) {
                if (tagElements[i].textContent === eventLabel) {
                    if (tagCounter === elementInstruction['tagIndex']) {
                        tagIndex = i;
                        break;
                    }
                    tagCounter += 1;
                }
            }
            elementObject = tagElements[tagIndex];
        }
        return elementObject
    }
}
