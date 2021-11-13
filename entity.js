class Entity {
    static emptyIDs = [];
    static list = [];
    static PhysicUpdate() {
        Entity.list.forEach( el => el.PhysicUpdate() );
    }
    static Send(pSocket) {
        Entity.list.forEach( el => el.Send(pSocket) );
    }

    Remove() {
        delete Entity.list[this.id];
        Entity.emptyIDs.push(this.id);
    }
    Send(pSocket) {
        const packet = {
            action: 'update',
            data: {
                id:       this.id,
                position: this.position,
                health:   this.health,
            },
        };
        pSocket.send(JSON.stringify(packet));
    }

    id = null;
    name = null;

    position = { x: 0, y: 0 };

    velocity = {x: 0, y: 0};
    moving = {x: 0, y: 0};
    speed = 1;

    PhysicUpdate() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
    SetVelocity(axis, val) {
        this.moving[axis] = val;

        const d = Math.sqrt(Math.pow(this.moving.x,2)+Math.pow(this.moving.y,2));

        this.velocity.x = d === 0? 0: this.moving.x / d * this.speed;
        this.velocity.y = d === 0? 0: this.moving.y / d * this.speed;
    }

    health = 100;
    maxHealth = 100;

    GetJSON() {
        return {
            id:       this.id,
            name:     this.name,
            position: this.position,
            health:   this.health,
        };
    }

    constructor(name, position, health) {
        this.position = position;
        this.health = health;
        this.name = name;

        this.id = Entity.emptyIDs.length > 0? Entity.emptyIDs[0]: Entity.list.length;
        Entity.list[this.id] = this;

        if (Entity.emptyIDs.length > 0)
            Entity.emptyIDs.splice(0, 1);
    }
}

exports.entityClass = Entity;