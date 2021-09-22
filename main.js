const
    fs = require('fs'),
    {app, BrowserWindow} = require('electron'),
    ws = require('ws'),
    request = require('request'),
    d2gsi = require('dota2-gsi'),
    {GlobalKeyboardListener} = require('node-global-key-listener');

const
    d2Listener = new d2gsi({port: 3008});

app.on('ready', async () => {
    const cfg = await cfgRequest();
    console.log(cfg);
    main(cfg.props);
})

function cfgRequest()
{
    return new Promise((resolve, reject) => {
        var cfgGUI = new BrowserWindow({'width': 550, 'height': 200, resizable: false});
        cfgGUI.menuBarVisible = false;
        cfgGUI.loadFile('./gui/config/main.html');
        var localConfig; 
        try 
        {
            localConfig = require('./appConfig.json');
        }
        catch(e) 
        {
            fs.writeFileSync('./appConfig.json', JSON.stringify({
                'props': {
                    'autoAccept': false,
                    'vkWrite': false,
                    'idVK': '',
                    'hidegui': 'NONE'
                },
                '_type': 'cfgSetup'
            }));
            localConfig = require('./appConfig.json');
        }
        var configSocket = new ws.Server({port: 8009});
        configSocket.once('connection', connection => {
            connection.send(JSON.stringify(localConfig));

            connection.on('message', data => {
                let msg = JSON.parse(data.toString());
                if(msg._type == 'cfgSetup') {
                    fs.writeFileSync('./appConfig.json', JSON.stringify(msg), 'utf8');
                    cfgGUI.hide();
                    connection.close();
                    configSocket.close();
                    resolve(msg);
                }
            })
        })
    })
}


function main(cfg)
{
    const mainGui = new BrowserWindow({'width': 180, 'height': 200, 'frame': false, 'resizable': false, 'movable': false, 'minimizable': false});
    mainGui.loadFile('./gui/main/main.html');
    mainGui.setAlwaysOnTop(true, 'screen-saver');
    mainGui.setOpacity(0.5);
    mainGui.setPosition(0, 220);

    var guiSocket = new ws.Server({port: 8008});
    guiSocket.once('connection', connection => {
        d2Listener.events.on('newclient', client => {
            setInterval(() => {connection.send(JSON.stringify(client.gamestate));}, 3000);
        })
    })

    const kInp = new GlobalKeyboardListener();
    kInp.addListener(function(e, down) {
        const hideKeyCode = cfg.hidegui.split('(')[1].slice(0, -1);
        if(e.vKey == hideKeyCode && e.state == "DOWN")
        {
            if(mainGui.getOpacity() > 0) mainGui.setOpacity(0);
            else mainGui.setOpacity(0.5);
        }
    })
    
}