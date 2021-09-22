const body = document.body;
var gold_logs = [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600];

function wsHandler()
{
    var socket = new WebSocket("ws://localhost:8008");
    socket.onmessage = function(event)
    {
        let message = JSON.parse(event.data);
        console.log(message);
        body.innerHTML = htmlBuilder(message);
    }
}

function htmlBuilder(message)
{
    let str = `gpm: ${message.player.gpm}<br>xpm: ${message.player.xpm}<br>streak: ${message.player.kill_streak} <br>${gold()}`;

    return str;

    function gold()
    {
        let totalgold = (message.map.clock_time <= 0) ? 600 : (message.player.gpm * message.map.clock_time / 60 + 600).toFixed(0);
        let kills = `kills: ${message.player.gold_from_hero_kills} (${(message.player.gold_from_hero_kills / totalgold * 100).toFixed(0)}%)`;
        let creeps = `creeps: ${message.player.gold_from_creep_kills} (${(message.player.gold_from_creep_kills / totalgold * 100).toFixed(0)}%)`;
        let income = `income: ${message.player.gold_from_income + 600} (${((message.player.gold_from_income + 600) / totalgold * 100).toFixed(0)}%)`;
        let pr = totalgold - message.player.gold_from_hero_kills - message.player.gold_from_creep_kills - message.player.gold_from_income - 600;
        let ost = `остальное: ${pr} (${(pr / totalgold * 100).toFixed(0)}%)`;
        return `gold earned: ${totalgold}<div class=acns>  ${kills}<br>    ${creeps}<br>   ${income}<br>   ${ost}</div> lst_min: ${lastMinGold()}`;

        function lastMinGold()
        {
            gold_logs.shift();
            gold_logs.push(totalgold);
            return(gold_logs[19] - gold_logs[0]);
        }
    }
}

wsHandler();