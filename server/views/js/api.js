function register(email, name, password, succ, fail) {
    $.ajax({
        type: 'POST',
        url: '/api/user/new',
        data: {
            name: name,
            email: email,
            password: password
        },
        success: succ,
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function login(email, password, succ, fail) {
    $.ajax({
        type: 'POST',
        url: '/api/user/login',
        data: {
            email: email,
            password: password
        },
        success: succ,
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function logout(succ) {
    $.ajax({
        type: 'POST',
        url: '/api/user/logout',
        success: succ
    });
}

function createEvent(eventName, template, allowsAnonymous, succ, fail) {
    $.ajax({
        type: 'POST',
        url: '/api/event/new',
        data: {
            name: eventName,
            project: null,
            allowsAnonymous: allowsAnonymous
        },
        success: succ,
        error: (XMLHttpRequest, textStatus, errorThrown)=>{ 
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function joinEvent(eventCode, succ, fail) {
    $.ajax({
        type: 'POST',
        url: `/api/event/join/${eventCode}`,
        success: succ,
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function leaveEvent(eventCode, succ, fail) {
    $.ajax({
        type: 'POST',
        url: `/api/event/leave/${eventCode}`,
        success: succ,
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function deleteEvent(eventCode, succ, fail) {
    $.ajax({
        type: 'DELETE',
        url: `/api/event/delete/${eventCode}`,
        success: succ,
        error: (XMLHttpRequest, textStatus, errorThrown)=>{ 
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function getEvents(succ, fail) {
    $.ajax({
        type: 'GET',
        url: `/api/event/events/`,
        success: (data, textStatus, XMLHttpRequest)=>{
            succ(XMLHttpRequest.responseJSON.hostedEvents, XMLHttpRequest.responseJSON.events)
        },
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function submitFeedback(eventCode, mood, feedback, isAnonymous, succ, fail) {
    $.ajax({
        type: 'POST',
        data: {
            mood: mood,
            content: feedback,
            eventID: eventCode,
            isAnonymous: isAnonymous,

        },
        url: `/api/feedback/new`,
        success: (data, textStatus, XMLHttpRequest)=>{
            succ()
        },
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail();
        }
    });
}

function getFeedback(eventCode, succ, fail) {
    console.log("called");
    $.ajax({
        type: 'GET',
        url: `/api/event/${eventCode}/feedback/`,
        success: (data, textStatus, XMLHttpRequest)=>{
            succ(XMLHttpRequest.responseJSON.data)
        },
        error: (XMLHttpRequest, textStatus, errorThrown)=>{
            fail(XMLHttpRequest.responseJSON.error);
        }
    });
}

function extractSentimentOverTime(feedback, succ, fail) { // Pass in as feedback returned object of getFeedback

}
