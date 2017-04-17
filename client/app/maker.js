let domoRenderer;
let domoForm;
let DomoFormClass;
let DomoListClass;

const handleDomo = (e) => {
    e.preventDefault();
    
    $("#domoMessage").animate({width:"hide"}, 350);
    
    if($("#domoName").val() == '' || $("#domoAge").val() == ''){
        handleError("RAWR! All fields are required");
        return false;
    }
    
    sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function() {
        domoRenderer.loadDomosFromServer();
    });
    
    return false;
};

const renderDomo = function() {
    return(
    <form id="domoForm"
        onSubmit={this.handleSubmit}
        name="domoForm"
        action="/maker"
        method="POST"
        className="domoForm"
        >
        
        <label htmlFor="name">Name: </label>
        <input id="domoName" type="text" name="name" placeholder="Domo Name"/>
        <label htmlFor="age">Age: </label>
        <input id="domoAge" type="text" name="age" placeholder="Domo Age"/>
        <input type="hidden" name="_csrf" value={this.props.csrf}/>
        <input className="makeDomoSubmit" type="submit" value="Make Domo"/>
    </form>
    );
};

let prev;

const renderDomoList = function() {
    if(this.state.data.length === 0) {
        return(
            <div className="domoList">
                <h3 className="emptyDomo">No Domos yet</h3>
            </div>
        );
    }

    const domoNodes = this.state.data.map(function(domo){
        
        return (
            <div key={domo._id} className="domo">
            <img src={domo.image} alt="domo face" className="domoFace"/>
            <h3 className="domoName"> Name: {domo.name}</h3>
            <h3 className="domoAge"> Age: {domo.age}</h3>
            <img src={domo.image} className="canvasSize" alt="domo face"/>
            <canvas ref={(input)=>{
            if(input===null)
                return;
var ctx=input.getContext("2d");
            ctx.drawImage(input.previousSibling, 0, 0, 300, 300);
            
            var shouldDraw = false;
            
            input.onmousedown = (e) =>{
                prev = {x: e.clientX, y: e.clientY};
                shouldDraw = true;
            };
            
            input.onmousemove = (e) => {
                
                if(shouldDraw){
                    var r = input.getBoundingClientRect();
                    let m = {x: e.clientX, y: e.clientY};
                    if(m.y>r.top && m.y<r.bottom && m.x>r.left && m.x<r.right){
                        ctx.moveTo(prev.x-r.left, (prev.y-r.top));
                        ctx.lineTo(m.x-r.left, (m.y-r.top));
                        ctx.stroke();
                        console.log("at "+(m.x-r.left)+", "+(m.y-r.top));
                    }
                    prev = m;
                }
            };
            
            input.onmouseup = (e) => {
                
                shouldDraw = false;
            };
                                  }} className="domoCanvas canvasSize" width="300" height="300">Image manipulation unsupported in your browser</canvas>
            <button className="domoUpdate" ref={(input)=>{
            if(input===null)
                return;
        
        
        input.onclick = () =>{
            
            console.log(input.previousSibling.toDataURL());
            input.previousSibling.previousSibling.src = input.previousSibling.toDataURL();
            
            let str = input.previousSibling.toDataURL().replace(/\//g, "///");
            
            
            sendAjax('POST','/saveDoodle',"img="+encodeURIComponent(str)+"&id="+input.nextSibling.innerHTML+"&_csrf="+_csrf, redirect);
            
        };
    }}>Save Doodle</button>
            <div className="hidden">{domo._id}</div>
            </div>
        );
        
        return(
            <div className="domoList">
            {domoNodes}
            </div>
        )
    });
    
    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
}
let _csrf;
const setup = function(csrf) {
    _csrf = csrf;
    DomoFormClass = React.createClass({
        handleSubmit: handleDomo,
        render: renderDomo,
    });
    
    DomoListClass = React.createClass({
        loadDomosFromServer : function () {
            sendAjax('GET', '/getDomos', null, function(data){
                this.setState({data:data.domos});
            }.bind(this));
        },
        getInitialState: function() {
            return {data: []};
        },
        componentDidMount: function() {
            this.loadDomosFromServer();
            //var $this = $(ReactDOM.findDOMNode(this));
            //// set el height and width etc.
        },
        render: renderDomoList,
        myClick: function(){
            alert("j");
        }
    });
    
    domoForm = ReactDOM.render(
        <DomoFormClass csrf={csrf} />, document.querySelector("#makeDomo")
    );
    
    domoRenderer = ReactDOM.render(
        <DomoListClass />, document.querySelector("#domos")
    );
}

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
}

$(document).ready(function(){
    getToken();
});