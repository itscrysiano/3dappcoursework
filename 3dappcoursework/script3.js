var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
let secondModelMixer, secondModelActions = [];
let sound, secondSound;

init();

function init(){

  const assetPath = './';

  clock = new THREE.Clock();
 
  scene = new THREE.Scene();

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('assets/textures/jersey-texture.png',
    function(texture) {
    scene.background = texture;
  });
 

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(3.873, 6.058, -4.269);


//Set up renderer for scene
const canvas = document.getElementById('threeContainer');
renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setPixelRatio( window.devicePixelRatio );
resize();

// Lights
const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 10, 5);
scene.add(keyLight);


const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, 5, 5);
scene.add(fillLight);


const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
backLight.position.set(0, 5, -5);
scene.add(backLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambient);


//Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(1, 2, 0);
controls.update();

// Wireframe toggle button
const wireframeBtn = document.getElementById("toggleWireframe");
wireframeBtn.addEventListener('click', function() {
  isWireframe = !isWireframe;
  toggleWireframe(isWireframe);
})


 // Textures and Materials
 const greenTexture = new THREE.TextureLoader().load('assets/materials/jersey-green-final-flipped-1.png');
 greenTexture.flipY = false;
 const greenJerseyMaterial = new THREE.MeshStandardMaterial({
   map: greenTexture,
   metalness: 0.00,
   roughness: 1.00,
 });

 const whiteTexture = new THREE.TextureLoader().load('assets/materials/jersey-white-final-flipped-1.png');
 whiteTexture.flipY = false;
 const whiteJerseyMaterial = new THREE.MeshStandardMaterial({
   map: whiteTexture,
   metalness: 0.00,
   roughness: 1.00,
 });

 // Button: Switch to white jersey
 document.getElementById("switchModel").addEventListener('click', function () {
   loadModel('assets/models/eagles-football-jersey-green.gltf', true, whiteJerseyMaterial);
   currentModelPath = 'assets/models/eagles-football-jersey-white.gltf';
 });

 const loader = new THREE.GLTFLoader();

function loadModel(modelPath, isAnimated = false, materialToApply = null) {
 if (loadedModel) {
   scene.remove(loadedModel);
   loadedModel.traverse(obj => {
     if (obj.geometry) obj.geometry.dispose();
     if (obj.material) {
       if (Array.isArray(obj.material)) {
         obj.material.forEach(m => m.dispose());
       } else {
         obj.material.dispose();
       }
     }
   });
 }

 loader.load(modelPath, function (giTf) {
   const model = giTf.scene;
   model.position.set(0, 0, 0);
   scene.add(model);
   loadedModel = model;

   model.traverse((child) => {
     if (child.isMesh) {
       console.log("Mesh name:", child.name);
       if (child.name === 'jersey' && materialToApply) {
         child.material = materialToApply;
         child.material.needsUpdate = true;
         console.log('Applied material to:', child.name);
       }
     }
   });

   const mixerInstance = new THREE.AnimationMixer(model);
   const animations = giTf.animations;
   const modelActions = [];

   animations.forEach(clip => {
     const action = mixerInstance.clipAction(clip);
     modelActions.push(action);
   });

   if (isAnimated) {
     secondModelMixer = mixerInstance;
     secondModelActions = modelActions;

     if (secondModelActions.length > 0) {
       secondModelActions.forEach(action => {
         action.reset();
         action.setLoop(THREE.LoopOnce);
         action.clampWhenFinished = true;
         action.play();
       });

       if (secondSound.isPlaying) secondSound.stop();
       secondSound.play();
     }
   } else {
     mixer = mixerInstance;
     actions = modelActions;

     if (actions.length > 0 && mode === "open") {
       actions.forEach(action => {
         action.timeScale = 1;
         action.reset();
         action.play();

         if (sound.isPlaying) sound.stop();
         sound.play();
       });
     }
   }

 }, undefined, function (error) {
   console.error("Error loading model:", error);
 });
}

 // Button: Load default green jersey again
 document.getElementById("btn").addEventListener('click', function () {
   loadModel('assets/models/eagles-football-jersey-green.gltf', true, greenJerseyMaterial);
   currentModelPath = 'assets/models/eagles-football-jersey-green.gltf';
 });

 // Initial load
 loadModel('assets/models/eagles-football-jersey-green.gltf', true, greenJerseyMaterial);

 window.addEventListener('resize', resize, false);
 animate();
}

function toggleWireframe(enable) {
  scene.traverse(function (object) {
    if (object.isMesh) {
      object.material.wireframe = enable;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (mixer) mixer.update(clock.getDelta());
  if (secondModelMixer) secondModelMixer.update(clock.getDelta());


renderer.render(scene, camera);
}

function resize(){
  const canvas = document.getElementById('threeContainer');
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

