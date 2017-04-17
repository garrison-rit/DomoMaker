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

var prev = void 0;

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
                        if (input === null) return;
                        var ctx = input.getContext("2d");
                        ctx.drawImage(input.previousSibling, 0, 0, 300, 300);

                        var shouldDraw = false;

                        input.onmousedown = function (e) {
                            prev = { x: e.clientX, y: e.clientY };
                            shouldDraw = true;
                        };

                        input.onmousemove = function (e) {

                            if (shouldDraw) {
                                var r = input.getBoundingClientRect();
                                var m = { x: e.clientX, y: e.clientY };
                                if (m.y > r.top && m.y < r.bottom && m.x > r.left && m.x < r.right) {
                                    ctx.moveTo(prev.x - r.left, prev.y - r.top);
                                    ctx.lineTo(m.x - r.left, m.y - r.top);
                                    ctx.stroke();
                                    //console.log("at "+(m.x-r.left)+", "+(m.y-r.top));
                                }
                                prev = m;
                            }
                        };

                        input.onmouseup = function (e) {

                            shouldDraw = false;
                        };
                    }, className: "domoCanvas canvasSize", width: "300", height: "300" },
                "Image manipulation unsupported in your browser"
            ),
            React.createElement(
                "button",
                { className: "domoUpdate", ref: function ref(input) {
                        if (input === null) return;

                        input.onclick = function () {

                            //console.log(input.previousSibling.toDataURL());
                            //input.previousSibling.previousSibling.src = input.previousSibling.toDataURL();

                            var str = input.previousSibling.toDataURL();
                            str = str.replace(/\//g, "///");

                            sendAjax('POST', '/saveDoodle', "img=" + encodeURIComponent(str) + "&id=" + input.nextSibling.innerHTML + "&_csrf=" + _csrf, redirect);
                        };
                    } },
                "Save Doodle"
            ),
            React.createElement(
                "div",
                { className: "hidden" },
                domo._id
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
var _csrf = void 0;
var setup = function setup(csrf) {
    _csrf = csrf;
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
        render: renderDomoList,
        myClick: function myClick() {
            alert("j");
        }
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
    console.log("data" + data);
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
