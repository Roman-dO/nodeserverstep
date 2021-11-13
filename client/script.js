let canvas, ctx;
let ws;
let wantedName = '';
let logElement;

const host = '192.168.43.217'
const port = 9090;

const log = (...data) => {
    for (let el of data) {
        logElement.innerText += el;
    }
    logElement.innerText += '\n';
    console.log(data);
};

class Entity {
    static list = [];
    static Draw() {
        for (let i in Entity.list) Entity.list[i].Draw();
    }

    position = {x: 0, y: 0};
    size = {x: 50, y: 50};
    color = 'black';

    Remove() {
        delete Entity.list[this.id];
    }

    Draw() {
        DrawRect(this.position, this.color, this.size);
    }
    SetUpdateDta(position, health) {
        this.position = position;
        this.health = health;
    }

    constructor(id, name, health, position, size={x: 50, y: 50}) {
        // Identification
        this.id = id;
        this.name = name;

        // Character
        this.health = health;

        // Drawing
        this.position = position;
        this.size = size;

        // Adding to global array
        Entity.list[id] = this;
    }
}

function DrawRect(pos, color='black', size={x: 50, y: 50}) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(pos.x, pos.y, size.x, size.y);
    ctx.restore();
}

function Start() {
    // Actions in the start
    Update();
}

function onBodyLoaded() {
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    logElement = document.getElementById('log');
    Start();
}

function Connect() {
    ws = new WebSocket(`ws://${host}:${port}`);

    let auth = false;
    let name = '';

    ws.onopen = (con) => {
        log('OPEN');
        name = wantedName? wantedName: 'Player ' + Math.round(Math.random()*999);
        const authPacket = {
            action: 'auth',
            data: {
                name: name,
            },
        };
        ws.send(JSON.stringify(authPacket));
    };
    ws.onmessage = (message) => {
        const msg = JSON.parse(message.data);

        switch (msg.action) {
            case 'auth-ans':
                auth = msg.data.success;
                log(auth ? 'Authorization is success.': 'Not authorized.');
                break;
            case 'create':
                let CreatingId = msg.data.id;
                let _nick = msg.data.name;
                let _position = msg.data.position;
                let _health = msg.data.health;

                let entity = new Entity(CreatingId, _nick, _health, _position);

                if (msg.data.own) {
                    name = _nick;
                    entity.color = 'red';
                }
                break;
            case 'remove':
                log(msg.data);
                const id = msg.data.id;
                Entity.list[id].Remove();
                break;
            case 'update':
                let searchedId = msg.data.id;

                Entity.list[searchedId].SetUpdateDta(
                    msg.data.position,
                    msg.data.health
                );
                break;
            default:
                log(msg.action + ' from ' + name + ' is not responded.', msg);
                break;
        }
    };
    ws.onclose = () => {
        isConnected = false;
        log('CLOSE');
    };
    ws.onerror = (error) => {
        log('ERROR');
    };
}

let isConnected = false;
document.addEventListener('click', (e) => {
    if (!isConnected) {
        Connect();
        isConnected = true;
    }
});

let isWPressed = false;
let isSPressed = false;
let isAPressed = false;
let isDPressed = false;

document.addEventListener('keydown', (e) => {
    if (isConnected) {
        let data;
        if (e.code === 'KeyW' && !isWPressed) {
            data = {axis: 'y', val: -1};
            isWPressed = true;
        }
        else if (e.code === 'KeyS' && !isSPressed) {
            data = {axis: 'y', val: 1};
            isSPressed = true;
        }
        else if (e.code === 'KeyA' && !isAPressed) {
            data = {axis: 'x', val: -1};
            isAPressed = true;
        }
        else if (e.code === 'KeyD' && !isDPressed) {
            data = {axis: 'x', val: 1};
            isDPressed = true;
        }
        else return;
        const startMoveMsg = {
            action: 'move',
            data: {
                axis: data.axis,
                val: data.val,
            },
        };

        ws.send(JSON.stringify(startMoveMsg));
    }
});

document.addEventListener('keyup', (e) => {
    if (isConnected) {
        let axis;
        if (e.code === 'KeyW') {
            isWPressed = false;
            if (!isSPressed) axis = 'y';
        }
        else if (e.code === 'KeyS') {
            isSPressed = false;
            if (!isWPressed) axis = 'y';
        }
        else if (e.code === 'KeyA') {
            isAPressed = false;
            if (!isDPressed) axis = 'x';
        }
        else if (e.code === 'KeyD') {
            isDPressed = false;
            if (!isAPressed) axis = 'x';
        }
        if (axis === '') return;

        const endMoveMsg = {
            action: 'move',
            data: {
                axis: axis,
                val: 0,
            },
        };
        ws.send(JSON.stringify(endMoveMsg));
    }
});

function Update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Entity.Draw();
    setTimeout(Update, 50);
}

let isTouched = false;

let FingerIdentifier = null;
let StartTouchPosition = {};
let minDistance = 5;

function touchStart(e) {
    log(e);
}
function touchMove(e) {
    log(e);
}
function touchEnd(e) {
    log(e);
}
document.addEventListener('touchstart', touchStart);
document.addEventListener('touchmove', touchMove);
document.addEventListener('touchend', touchEnd);