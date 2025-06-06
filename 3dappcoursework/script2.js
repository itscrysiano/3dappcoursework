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
  textureLoader.load('assets/textures/helmet-background.png',
    function(texture) {
    scene.background = texture;

  });
 

//Camera
  camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(27.182, 12.045, -1.220);

//Set up renderer for scene
const canvas = document.getElementById('threeContainer');
renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setPixelRatio( window.devicePixelRatio );
resize();

//Lights
const topLight = new THREE.DirectionalLight(0xFFFFFF, 2);
topLight.position.set(1.7, 4.8, 4);
topLight.target.position.set(0, 0, 0);
scene.add(topLight);
scene.add(topLight.target);

const rightLight = new THREE.PointLight(0xFFFFFF, 0.5, 10);  
rightLight.position.set(3.2, 0.2, 5);
scene.add(rightLight);

const sideLight = new THREE.PointLight(0xFFFFFF, 4, 20);  
sideLight.position.set(5, 0, 0);
scene.add(sideLight);

const leftLight = new THREE.PointLight(0xFFFFFF, 3, 10);  
leftLight.position.set(-4, 0, 0);  
scene.add(leftLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x777777, 0.3, 10);
pointLight.position.set(3, 2, 5);
scene.add(pointLight);


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

//Loads the giTF model
const loader = new THREE.GLTFLoader();
function loadModel(modelPath, isAnimated = false) {
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

  loader.load(modelPath, function (giTF) {
    const model = giTF.scene;
    model.position.set(0, 0, 0);
    scene.add(model);
    loadedModel = model;

    const mixerInstance = new THREE.AnimationMixer(model);
    const animations = giTF.animations;
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
      } else {
        console.warn('No animations found in animated model.');
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
    applyMaterials(model);
  }, undefined, function (error) {
    console.error("Error loading model:", error);
  });
}

document.getElementById("btn").addEventListener('click', function () {
  loadModel('assets/models/eagles_helmet.gltf', true);
  currentModelPath = 'assets/models/eagles_helmet.gltf';
});

loadModel('assets/models/eagles_helmet.gltf', true);

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

