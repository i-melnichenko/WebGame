/**
 * Created by imelnichenko on 29.04.15.
 */

var Enemy = function (options, loadingCallback){
    Unit.call(this, options, loadingCallback);

};

Enemy.prototype = Object.create( Unit.prototype );
Enemy.prototype.constructor = Enemy;