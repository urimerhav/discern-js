class Discern {
    constructor(user_api) {
        this.getAnalysis();
        this.analyze()
    }

    getAnalysis() {
        // Queries the backend for all elements on this page
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                applyListeners(JSON.parse(this.responseText));
            }
        };
        const url = 'https://discern-app.herokuapp.com/get_all_elements';
        // const url = 'http://localhost:5000/get_all_elements';
        const data = JSON.stringify(
            {'domain': document.location.host,
                    'page': document.location.pathname});
        xhr.open("POST", url, true);
        xhr.send(data);
    }

    analyze() {
        // This function reports the current html page to our webserver
        // we also want to expand every "relative path" resource. this is TBD.
        const Http = new XMLHttpRequest();
        const url = 'https://discern-app.herokuapp.com/analyze_page';
        // const url = 'http://localhost:5000/analyze_page';
        // var bodyHtml = document.getElementsByTagName('body')[0].innerHTML;
        const data = JSON.stringify(
            {'domain': document.location.host,
                    'page': document.location.pathname,
                    'html': ''});
        Http.open("POST", url, true);
        Http.send(data);
    }
}


function applyListeners(elementDicts) {
    const keys = Object.keys(elementDicts);
    for (let key of keys) {
        let elementDict = elementDicts[key];
        if ((!("instruction" in elementDict)) || (!("event_action" in elementDict)) || (!("inner_text" in elementDict))) {
            continue;
        }
        let elementInstruction = elementDict['instructions'];
        let eventAction = elementDict['event_action'];
        let eventLabel = elementDict['inner_text'];
        var elementObject = null;
        if (elementInstruction['id'] !== '') {
            elementObject = document.getElementById(elementInstruction['id']);
        }
        else if (elementInstruction['className'] !== '') {
            let classElements = document.getElementsByClassName(elementInstruction['className']);
            var classCounter = 0;
            var classIndex = -1;
            for (let i = 0; i < classElements.length; i++) {
                if (classElements[i].textContent === eventLabel) {
                    if (classCounter === elementInstruction['classIndex']) {
                        classIndex = classCounter;
                    }
                    else {
                        classCounter += 1;
                    }
                }
            }
            elementObject = classElements[classIndex];
        }
        else if (elementInstruction['tagName'] !== '') {
            let tagElements = document.getElementsByTagName(elementInstruction['tagName']);
            var tagCounter = 0;
            var tagIndex = -1;
            for (let i = 0; i < tagElements.length; i++) {
                if (tagElements[i].textContent === eventLabel) {
                    if (tagCounter === elementInstruction['classIndex']) {
                        tagIndex = tagCounter;
                    }
                    else {
                        tagCounter += 1;
                    }
                }
            }
            elementObject = tagElements[tagIndex];
        }
        if (elementObject !== null) {
            elementObject.addEventListener('click', () => reportEvent(eventAction, eventLabel))
        }
    }
}


function reportEvent(eventAction, eventLabel) {
    // and so report for every analytic suite, in order of priority

    const eventCategory = 'Discern: ' + document.location.pathname;

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


function annotateElement(event_action) {
    const activeElement = document.activeElement;
    var output_json = {
        'domain': document.location.host,
        'page': document.location.pathname,
        'event_action': event_action,
        'inner_text': activeElement.textContent,
        'instructions': {
            'id': '',
            'className': '',
            'classIndex': '',
            'tagName': '',
            'tagIndex': ''}
    };
    var addElement = false;

    // first see if this element has an ID
    if (activeElement.id !== "") {
        output_json['instructions']['id'] = activeElement.id;
        addElement = true;
    }

    // second, see if this element has an class
    else if (activeElement.className !== "") {
        const classElements = document.getElementsByClassName(activeElement.className);
        var classCounter = 0;
        var classIndex = -1;
        for (let i = 0; i < classElements.length; i++) {
            if (classElements[i] === activeElement) {
                classIndex = classCounter;
            }
            else if (classElements[i].textContent === activeElement.textContent) {
                classCounter += 1;
            }
        }
        output_json['instructions']['className'] = activeElement.className;
        output_json['instructions']['classIndex'] = classIndex;
        addElement = true;
    }

    // third, use the tag
    else if (activeElement.tagName !== "") {
        const tagElements = document.getElementsByTagName(activeElement.tagName);
        var tagCounter = 0;
        var tagIndex = -1;
        for (let i = 0; i < tagElements.length; i++) {
            if (tagElements[i] === activeElement) {
                tagIndex = tagCounter;
            }
            else if (tagElements[i].textContent === activeElement.textContent) {
                tagCounter += 1;
            }
        }
        output_json['instructions']['tagName'] = activeElement.tagName;
        output_json['instructions']['tagIndex'] = tagIndex;
        addElement = true;
    }
    if (addElement) {
        const Http = new XMLHttpRequest();
        const url = 'https://discern-app.herokuapp.com/add_element';
        // const url = 'http://localhost:5000/add_element';
        const data = JSON.stringify(output_json);
        Http.open("POST", url, true);
        Http.send(data);
        console.log("Added element named '" + output_json['event_action'] + "', inner text: '" + output_json['inner_text'] + "'");
    }
}
