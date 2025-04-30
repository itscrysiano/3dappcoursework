var scene, camera, renderer, clock, mixer, action = [], mode;

init();

function init() {

    const assetPath = './';

    clock = new THREE.Clock();

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xacc0c6);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(-5, 25, 20);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(ambient);

    const light = new THREE.DirectionalLight();
    light.position.set(0,10,2);
    scene.add(light);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(1,2,0);
    controls.update();

    mode = "spin"
    const btn = document.getElementById("btn");
    btn.addEventListener('click', function(){
    if (actions.length === 2){
        if (mode=== "spin"){
            actions.forEach(action =>{
                action.timeScale = 1.;
                action.reset();
                action.play();
            })
        }
    }

    });
    
 //GLFT Loader

    const loader = new THREE.GLTFLoader();
    loader.load(assetPath + 'assets/models/superbowl_trophy_animation.glb', function(gltf){
    const model = gltf.scene;
    scene.add(mode):
    
    })


    window.addEventListener('resize', onResize, false);
    
    update();

}

function update(){

    requestAnimationFrame(update);

    box.rotation.y +=0.01;

    renderer.render(scene, camera);


}

function onResize(){
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectMatrix();
renderer.setSize(windown.innerWidth, window.innerHeight);

}