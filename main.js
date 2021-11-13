const host = '192.168.43.217';
const port = 9090;

const Entity = require('./entity').entityClass;

class Player {
    static emptyIDs = [];
    static list = [];

    name = "Unnamed";
    id = null;

    controlled = null;

    Remove() {
        delete Player.list[this.id];
        Player.emptyIDs.push(this.id);

        this.controlled.Remove();
    }

    constructor(entityName) {
        let position = {
            // 25-375
            x: Math.random()*350+25,
            // 25-275
            y: Math.random()*350+25,
        };

        this.controlled = new Entity(
            entityName,
            position,
            50 + (Math.random() * 50)
        );
        this.name = entityName;
        this.id = Player.emptyIDs.length > 0?
            Player.emptyIDs[0]:
            Player.list.length;

        if (Player.emptyIDs.length > 0) Player.emptyIDs.splice(0, 1);

        Player.list[this.id] = this;
    }
}

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 9090 });

server.on('connection', (ws) => {
    console.log('CONNECTION');

    let player = null;
    let auth = false; // auth data;

    ws.on('message', (message) => {
        const msg = JSON.parse(message);

        switch (msg.action) {
            case 'auth':
                player = new Player(msg.data.name);
                player.socket = ws;
                CreateOneForAll(player);
                CreateAllForOne(player);
                ws.send(JSON.stringify({
                    action: 'auth-ans',
                    data: {success: true},
                }));
                break;
            case 'move':
                player.controlled.SetVelocity(msg.data.axis, msg.data.val);

                break;
        }
    });
    ws.on('close', () => {
        console.log('Player ' + player.name + ' is disconnected.');
        player.Remove();
        RemoveOneForAll(player);
        console.log('Player ' + this.name + ' is removed');
    });
    ws.on('error', (error) => {
        console.log('ERROR with ' + player.name);
    })
});

function CreateOneForAll(player) {
    let entityData = player.controlled.GetJSON();

    for (let i in Player.list) {
        let target = Player.list[i];
        entityData.own = target === player;
        let packet = {
            action: 'create',
            data: entityData,
        };
        target.socket.send(JSON.stringify({action: 'create',data: entityData}));
    }
}

function CreateAllForOne(player) {
    for (let i in Player.list) {
        let target = Player.list[i];
        if (target.id === player.id) continue;

        let entityData = target.controlled.GetJSON();

        let packet = {
            action: 'create',
            data: entityData,
        };
        player.socket.send(JSON.stringify(packet));
    }
}

function RemoveOneForAll(player) {
    const packet = {
        action: 'remove',
        data: {id: player.controlled.id,},
    };

    for (let i in Player.list) {
        let target = Player.list[i];
        if (target === null) continue;
        target.socket.send(JSON.stringify(packet));
    }
}

function Update() {
    Entity.PhysicUpdate();
    Player.list.forEach( el => Entity.Send(el.socket) );
    setTimeout(Update, 20);
} Update();

function Show() {
    // Логирование позиций игроков
    /*let ans = '';
    Entity.list.forEach((el, i) => {
        ans += `${i}. ${el.name} (${el.position.x}, ${el.position.y}).\n`;
        // if (i < Entity.list.length-1) ans += '\n';
    });
    console.log(ans);*/
    setTimeout(Show, 2000);
} Show();

