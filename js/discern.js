// Discern - automatic event reporting.
class Discern {
    constructor(user_api) {
        this.getElementsFromBackend();
        this.sendPageForAnalysis();
    }

    getElementsFromBackend() {
        // Queries the backend for all elements on this page
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                applyListeners(JSON.parse(this.responseText));
            }
        };
        const url = 'https://discern-app.herokuapp.com/get_all_elements';
        // const url = 'http://localhost:5000/get_all_elements';
        const data = JSON.stringify(
            {
                'domain': document.location.host,
                'page': document.location.pathname
            });
        xhr.open("POST", url, true);
        xhr.send(data);
    }

    sendPageForAnalysis() {
        // This function reports the current html page to our webserver
        // we also want to expand every "relative path" resource. this is TBD.

        const url = 'https://discern-app.herokuapp.com/analyze_page';
        // const url = 'http://localhost:5000/analyze_page';

        const data = JSON.stringify(
            {
                'domain': document.location.host,
                'page': document.location.pathname,
                'html': new XMLSerializer().serializeToString(document)
            });

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                sendAllClickableElements(JSON.parse(this.responseText));
            }
        };
        xhr.open("POST", url, true);
        xhr.send(data);
    }
}



function applyListeners(elementDicts) {
    const keys = Object.keys(elementDicts);
    for (let key of keys) {
        let elementDict = elementDicts[key];
        let elementObject = DiscernStatic.locateElement(elementDict);
        let eventAction = elementDict['event_action'];

        if ((elementObject !== null) && (typeof elementObject !== 'undefined')) {
            elementObject.addEventListener('click', () => reportEvent(eventAction))
        }
    }
}




function reportEvent(eventAction, eventLabel=null) {
    // report for every analytic suite, in order of priority

    const eventCategory = 'Discern';

    // segment
    if (typeof analytics !== 'undefined') {
        analytics.track(eventAction, {'category': eventCategory, 'label': eventLabel});
    }

    // google tag manager
    // else if (typeof dataLayer !== 'undefined') {
    //     dataLayer.push({'event': eventAction, 'event_category': eventCategory, 'event_label': eventLabel});
    // }

    // google analytics (gtag version)
    else if (typeof gtag !== 'undefined') {
        gtag('event', eventAction, {'event_category': eventCategory, 'event_label': eventLabel})
    }

    // google analytics (ga version)
    else if (typeof ga !== 'undefined') {
        ga('send', 'event', eventCategory, eventAction, eventLabel);
    }
}


function sendAllClickableElements(responseDict) {
    if (("send_all_elements" in responseDict) && responseDict["send_all_elements"] === true) {
        const aTags = document.getElementsByTagName("a");
        const buttonTags = document.getElementsByTagName("button");
        for (let i = 0; i < aTags.length; i++) {
            sendAllInfoForElement(aTags[i], false)
        }
        for (let i = 0; i < buttonTags.length; i++) {
            sendAllInfoForElement(buttonTags[i], false)
        }
    }
}


function annotateElement(eventAction) {
    sendAllInfoForElement(document.activeElement, true, eventAction)
}


function sendAllInfoForElement(element, annotated, eventAction = '') {
    var output_json = {
        'domain': document.location.host,
        'page': document.location.pathname,
        'event_action': eventAction,
        'inner_text': element.textContent,
        'annotated': annotated,
        'instructions': {
            'id': '',
            'className': '',
            'classIndex': '',
            'tagName': '',
            'tagIndex': ''
        }
    };
    var addElement = false;

    // first see if this element has an ID
    if (element.id !== "") {
        output_json['instructions']['id'] = element.id;
        addElement = true;
    }

    // second, see if this element has an class
    if (element.className !== "") {
        const classElements = document.getElementsByClassName(element.className);
        var classCounter = 0;
        var classIndex = -1;
        for (let i = 0; i < classElements.length; i++) {
            if (classElements[i].textContent === element.textContent) {
                if (classElements[i] === element) {
                    classIndex = classCounter;
                    break;
                }
                classCounter += 1;
            }
        }
        output_json['instructions']['className'] = element.className;
        output_json['instructions']['classIndex'] = classIndex;
        addElement = true;
    }

    // third, use the tag
    if (element.tagName !== "") {
        const tagElements = document.getElementsByTagName(element.tagName);
        var tagCounter = 0;
        var tagIndex = -1;
        for (let i = 0; i < tagElements.length; i++) {
            if (tagElements[i].textContent === element.textContent) {
                if (tagElements[i] === element) {
                    tagIndex = tagCounter;
                    break;
                }
                tagCounter += 1;
            }
        }
        output_json['instructions']['tagName'] = element.tagName;
        output_json['instructions']['tagIndex'] = tagIndex;
        output_json['instructions']['innerHTML'] = element.innerHTML;
        addElement = true;
    }
    if (addElement) {
        const Http = new XMLHttpRequest();
        const url = 'https://discern-app.herokuapp.com/add_element';
        // const url = 'http://localhost:5000/add_element';
        const data = JSON.stringify(output_json);
        Http.open("POST", url, true);
        Http.send(data);
        if (annotated) {
            console.log("Added element named '" + output_json['event_action'] + "', inner text: '" + output_json['inner_text'] + "'");
        }
    }
}

class DiscernStatic{
//    this contains all the static function for discern. used to avoid scope collisions with other scripts
    static locateElement(elementDict, doc = document) {
        var elementObject = null;
        if ((!("instructions" in elementDict)) || (!("event_action" in elementDict)) || (!("inner_text" in elementDict))) {
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