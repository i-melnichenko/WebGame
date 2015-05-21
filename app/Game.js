var Game = {
    WIDTH:  window.innerWidth-20,
    HEIGHT: window.innerHeight-20,
    mouse:  new THREE.Vector2(),
    clock:  new THREE.Clock(),

    renderer:  null,
    scene:     null,
    camera:    null,
    raycaster: null,
    intersected: null,
    world: null,

    onRenderFcts: [],

    init:function()
    {
        this.camera   = this.createCamera();
        this.scene    = new THREE.Scene();
        this.renderer = this.createRenderer();
        this.raycaster = new THREE.Raycaster();

        var ambient = new THREE.AmbientLight( 0x221100 );
        this.scene.add( ambient );

        var light = new THREE.DirectionalLight( 0xebf3ff, 1.6 );
        light.position.set( 0, 140, 500 ).multiplyScalar( 1.1 );
        this.scene.add( light );

        light.castShadow = true;

        light.shadowMapWidth = 1024;
        light.shadowMapHeight = 2048;

        var d = 390;

        light.shadowCameraLeft = -d;
        light.shadowCameraRight = d;
        light.shadowCameraTop = d * 1.5;
        light.shadowCameraBottom = -d;

        light.shadowCameraFar = 3500;


        var container = document.getElementById( 'wrap' );
        container.appendChild( this.renderer.domElement );

        window.addEventListener( 'mousemove', Game.onMouseMove, false );

        this.onRenderFcts.push(function(){
            Game.renderer.render( Game.scene, Game.camera );
        });

        this.world	= new OIMO.World(1/120, 2, 8);
       // new OIMO.Body({size:[1, 10, 100], pos:[10,-1,-10], world:this.world});

        setInterval(function(){
            Game.world.step();
        }, 1000/60);

        var map = [10,-10];
        var unit = new Enemy({
            skin:'ratamahatta'
        }, function(obj){
            var a = function(i){
                obj.moveTo(new THREE.Vector3(map[i], 0, 0),function(){
                    i++;
                    if(i==map.length) i =0;
                    setTimeout(function () {
                        new a(i);
                    },2000);
                });
            };
            new a(0);
        });
        this.scene.add(unit.getObject3d());


        this.createGround();

        this.animate();
    },
    createCamera:function()
    {
        var camera = new THREE.PerspectiveCamera( 30, this.WIDTH / this.HEIGHT, 1, 10000 );
        camera.position.set(0,20,30);
        camera.lookAt(new THREE.Vector3(0,0,0));

        var controls = new THREE.OrbitControls( camera );
        controls.target = new THREE.Vector3( 0, 0, 0 );
        controls.update();

        return camera;
    },
    createRenderer:function()
    {
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor( 0x82D0FF );
        renderer.setSize( this.WIDTH, this.HEIGHT );
        renderer.shadowMapEnabled = true;

        return renderer;
    },

    createGround:function()
    {
        var ground = new OIMO.Body({size:[100, 1, 100], pos:[0,-1,0], world:this.world});
        var groundPlane = new THREE.Mesh(
            new THREE.BoxGeometry(100, 1, 100),
            new THREE.MeshBasicMaterial({
                color: 0x74DC53
            }));
        groundPlane.position.set(0,-1,0);
        this.scene.add(groundPlane);

        var nTufts	= 1;
        var positions	= new Array(nTufts)
        for(var i = 0; i < nTufts; i++){
            var position	= new THREE.Vector3();
            position.x	= 0;
            position.z	= 0;
            positions[i]	= position;
        }
        var mesh	= THREEx.createGrassTufts(positions);
        this.scene.add(mesh);
       /* // load the texture
        var textureUrl		= THREEx.createGrassTufts.baseUrl+'images/grass01.png'
        var material		= mesh.material
        material.map		= THREE.ImageUtils.loadTexture(textureUrl)
        material.alphaTest	= 0.7*/
    },
    debug:function()
    {
        this.scene.add(new THREE.AxisHelper(100));
        this.scene.add(new THREE.GridHelper(100,10));

    },
    onMouseMove:function(event)
    {
        event.preventDefault();
        Game.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        Game.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    },
    animate:function(nowMsec)
    {
        window.requestAnimationFrame( Game.animate );
        Game.render(nowMsec);
    },
    render:function(nowMsec)
    {
       /* // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera( this.mouse, this.camera );
        // calculate objects intersecting the picking ray
        var intersects = this.raycaster.intersectObjects( this.scene.children );

        if ( intersects.length > 0 && intersects[ 0 ].object.mouseactive ) {

            if ( this.intersected != intersects[ 0 ].object ) {
                if ( this.intersected ) this.intersected.mouseout();
                this.intersected = intersects[ 0 ].object;
                this.intersected.hover();
            }

        } else {
            if ( this.intersected ) this.intersected.mouseout();
            this.intersected = null;
        }

        */
        var delta = this.clock.getDelta();

        this.onRenderFcts.forEach(function(onRenderFct){
            onRenderFct(delta);
        })
    }
};

THREEx.MD2CharacterRatmahatta.baseUrl = './bower_components/threex.md2character/';
THREEx.createGrassTufts.baseUrl = './bower_components/threex.grass/';