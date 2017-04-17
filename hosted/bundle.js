"use strict";

var domoRenderer = void 0;
var domoForm = void 0;
var DomoFormClass = void 0;
var DomoListClass = void 0;

var handleDomo = function handleDomo(e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: "hide" }, 350);

    if ($("#domoName").val() == '' || $("#domoAge").val() == '') {
        handleError("RAWR! All fields are required");
        return false;
    }

    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
        domoRenderer.loadDomosFromServer();
    });

    return false;
};

var renderDomo = function renderDomo() {
    return React.createElement(
        "form",
        { id: "domoForm",
            onSubmit: this.handleSubmit,
            name: "domoForm",
            action: "/maker",
            method: "POST",
            className: "domoForm"
        },
        React.createElement(
            "label",
            { htmlFor: "name" },
            "Name: "
        ),
        React.createElement("input", { id: "domoName", type: "text", name: "name", placeholder: "Domo Name" }),
        React.createElement(
            "label",
            { htmlFor: "age" },
            "Age: "
        ),
        React.createElement("input", { id: "domoAge", type: "text", name: "age", placeholder: "Domo Age" }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: this.props.csrf }),
        React.createElement("input", { className: "makeDomoSubmit", type: "submit", value: "Make Domo" })
    );
};

var renderDomoList = function renderDomoList() {
    if (this.state.data.length === 0) {
        return React.createElement(
            "div",
            { className: "domoList" },
            React.createElement(
                "h3",
                { className: "emptyDomo" },
                "No Domos yet"
            )
        );
    }

    var domoNodes = this.state.data.map(function (domo) {

        //console.dir(domo.image);
        return React.createElement(
            "div",
            { key: domo._id, className: "domo" },
            React.createElement("img", { src: domo.image, alt: "domo face", className: "domoFace" }),
            React.createElement(
                "h3",
                { className: "domoName" },
                " Name: ",
                domo.name
            ),
            React.createElement(
                "h3",
                { className: "domoAge" },
                " Age: ",
                domo.age
            ),
            React.createElement("img", { src: domo.image, className: "canvasSize", alt: "domo face" }),
            React.createElement(
                "canvas",
                { ref: function ref(input) {
                        console.dir(input);
                        var ctx = input.getContext("2d");
                        ctx.rect(0, 0, 300, 300);
                        ctx.fill();
                    }, className: "domoCanvas canvasSize" },
                "Image manipulation unsupported in your browser"
            ),
            React.createElement(
                "button",
                { className: "domoUpdate" },
                "Update Face"
            )
        );

        return React.createElement(
            "div",
            { className: "domoList" },
            domoNodes
        );
    });

    return React.createElement(
        "div",
        { className: "domoList" },
        domoNodes
    );
};

var setup = function setup(csrf) {

    DomoFormClass = React.createClass({
        displayName: "DomoFormClass",

        handleSubmit: handleDomo,
        render: renderDomo
    });

    DomoListClass = React.createClass({
        displayName: "DomoListClass",

        loadDomosFromServer: function loadDomosFromServer() {
            sendAjax('GET', '/getDomos', null, function (data) {
                this.setState({ data: data.domos });
            }.bind(this));
        },
        getInitialState: function getInitialState() {
            return { data: [] };
        },
        componentDidMount: function componentDidMount() {
            this.loadDomosFromServer();
            //var $this = $(ReactDOM.findDOMNode(this));
            //// set el height and width etc.
        },
        render: renderDomoList
    });

    domoForm = ReactDOM.render(React.createElement(DomoFormClass, { csrf: csrf }), document.querySelector("#makeDomo"));

    domoRenderer = ReactDOM.render(React.createElement(DomoListClass, null), document.querySelector("#domos"));
};

var getToken = function getToken() {
    sendAjax('GET', '/getToken', null, function (result) {
        setup(result.csrfToken);
    });
};

$(document).ready(function () {
    getToken();
});
"use strict";

var handleError = function handleError(message) {
    $("#errorMessage").text(message);
    $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
    $("#domoMesage").animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        dataType: 'json',
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }

    });
};
