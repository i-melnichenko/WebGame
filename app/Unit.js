/**
 * Created by imelnichenko on 22.04.15.
 */

var Unit = function(options, loadingCallback) {
    var _this = this;
    this.initOptions(options);

    this.ratamahatta = new THREEx.MD2CharacterRatmahatta();
    this.body = null;
    this.target = new THREE.Vector3();
    this.target.copy(this.getObject3d().position);
    this.vasMoving = false;
    this.movingCallback = null;

    Game.onRenderFcts.push(function(delta){
        _this.getObject3d().position.copy(_this.getBody().getPosition());

        _this.movement(delta);
        _this.ratamahatta.update(delta);
    });

    this.ratamahatta.character.addEventListener('loaded', function(){
        _this.ratamahatta.setSkinName(_this.options.skin);
        _this.ratamahatta.setWeaponName(_this.options.weapon);
        new loadingCallback(_this);
        console.log(_this.getBody());
    });
};

Unit.prototype.initOptions = function (options){
    this.options = Object.extend( {
        skin: 'dead',
        weapon: 'w_bfg'
    }, options || {});

};

Unit.prototype.getObject3d = function(){

    return this.ratamahatta.character.object3d;
};

Unit.prototype.getBody = function(){
    if(this.body){
        return this.body;
    }

    this.body = new OIMO.Body({
        type	:'box',
        size	: [1,1,1],
        pos	: this.getObject3d().position.toArray(),
        rot	: this.getObject3d().rotation.toArray().slice(0,3).map(function(radian) {
            return radian * (180 / Math.PI);
        }),
        world	: Game.world,
        move	: true
    });

    return this.body;
};

Unit.prototype.movement = function(delta){
    var _this = this,
        vasMoving = _this.vasMoving,
        position = this.getBody().getPosition(),
        target = this.target,
        speed = .05,
        compensator = function(a){
            var buff = position[a] - target[a];
            //console.log(a, Math.abs(buff));
            if(Math.abs(buff) < speed){
                position[a] = target[a];
            }
        };

    _this.vasMoving = false;


    (['x','z']).forEach(function(a){
        if(position[a] < target[a] && Math.abs(position[a] - target[a]) >= speed){
            //console.log('move + '+a);
            position[a] += speed;
            new compensator(a);
            _this.vasMoving = true;
        }
        if(position[a] > target[a] && Math.abs(position[a] - target[a]) >= speed){
            //console.log('move - '+a);
            position[a] -= speed;
            new compensator(a);
            _this.vasMoving = true;
        }
    });

    this.getBody().resetPosition(position.x,position.y,position.z);

    if(vasMoving && !_this.vasMoving){
        this.ratamahatta.setAnimationName('stand');
        if(this.movingCallback){
            new this.movingCallback();
        }
    }
};

Unit.prototype.moveTo = function(target, callback){
    this.ratamahatta.setAnimationName('run');
    this.movingCallback = callback;
    this.getObject3d().lookAt(target);
    this.target.copy(target);
    //this.getObject3d().translateX( vector.x );
    //this.getObject3d().translateZ( vector.z );
    //this.resetBody();
};