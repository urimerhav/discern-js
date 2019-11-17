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


function applyListeners(elementInstructions) {
    const keys = Object.keys(elementInstructions);
    for (let key of keys) {
        let elementInstruction = elementInstructions[key];
        var element = null;
        let elementName = '';
        if (elementInstruction['id'] !== '') {
            element = document.getElementById(elementInstruction['id']);
            elementName = nameElement(element)
        }
        else if (elementInstruction['className'] !== '') {
            let classElements = document.getElementsByClassName(elementInstruction['className']);
            element = classElements[elementInstruction['classIndex']];
            elementName = nameElement(element, elementInstruction['classIndex'])
        }
        if (element !== null) {
            console.log(element);
            element.addEventListener('click', () => reportEvent(elementName))
        }
    }
}


function nameElement(element, classIdx=null) {
    if (element.id) {
        return element.id;
    }
    if (element.innerText) {
        return element.innerText;
    }
    if (element.className && classIdx) {
        return element.className + "_" + classIdx;
    }
    return 'unknown_button'
}


function reportEvent(elementName, payload=null) {
    // and so report for every analytic suite

    // google analytics, gtag version
    if (typeof gtag !== 'undefined') {
        gtag('event', elementName, {'event_category': 'button', 'event_label': 'discern'})
    }

    // google analytics, gtag version
    if (typeof ga !== 'undefined') {
        ga('send', {hitType: 'event', eventCategory: 'button', eventAction: elementName, eventLabel: 'discern'});
    }

    if (typeof analytics !== 'undefined') {
        analytics.track(elementName + ' click', payload)
    }

    if (typeof analytics !== 'undefined') {
        analytics.track(elementName + ' click', payload)
    }
}


function WriteElementToDB(activeElement, name='') {
    var output_json = {
        'domain': document.location.host,
        'page': document.location.pathname,
        'name': name,
        'instructions': {
            'id': '',
            'className': '',
            'classIndex': ''}
    };
    var addElement = false;

    if (activeElement.id !== "") {
        output_json['instructions']['id'] = activeElement.id;
        addElement = true;
    }
    else if (activeElement.className !== "") {
        const classElements = document.getElementsByClassName(activeElement.className);
        var i;
        var classIndex = -1;
        for (i = 0; i < classElements.length; i++) {
            if (classElements[i] === activeElement) {
                classIndex = i;
            }
        }
        output_json['instructions']['className'] = activeElement.className;
        output_json['instructions']['classIndex'] = classIndex;
        addElement = true;
    }

    if (addElement) {
        const Http = new XMLHttpRequest();
        const url = 'https://discern-app.herokuapp.com/add_element';
        // const url = 'http://localhost:5000/add_element';
        const data = JSON.stringify(output_json);
        Http.open("POST", url, true);
        Http.send(data);
    }
}
