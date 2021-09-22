const 
    autoAccept = document.getElementById('autoAccept'),
    vkWrite = document.getElementById('vkWrite'),
    submit = document.getElementById('submit'),
    hidegui = document.getElementById('hidegui');

autoAccept.onclick = updGui;
vkWrite.onclick = updGui;

function updGui()
{
    document.getElementById('acNextStep').hidden = !autoAccept.checked;
    document.getElementById('vkIDBlock').hidden = !vkWrite.checked;
}
function wsConnect()
{
    var socket = new WebSocket("ws://localhost:8009");
    socket.onmessage = function(event)
    {
        let message = JSON.parse(event.data);
        if(message._type == 'cfgSetup') {cfgSetup(message); updGui(); return;}
    }

    
    submit.onclick = function()
    {
        socket.send(JSON.stringify({
            '_type': 'cfgSetup',
            'props': {
                'autoAccept': autoAccept.checked,
                'vkWrite': vkWrite.checked,
                'idVK': document.getElementById('idVK').value,
                'hidegui': hidegui.value
            }
        }))
        socket.close();
    }

    function cfgSetup(msg)
    {
        autoAccept.checked = msg.props.autoAccept;
        vkWrite.checked = msg.props.vkWrite;
        document.getElementById('idVK').value = msg.props.idVK;
        hidegui.value = msg.props.hidegui;
    }
}

hidegui.onclick = function() {
    hidegui.value = '...';
    this.onkeydown = function(event) {
        if(event.code == 'Escape') hidegui.value = 'NONE(-1)';
        else hidegui.value = `${event.code}(${event.keyCode})`;
    }
}

wsConnect();
updGui();