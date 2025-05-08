var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
/*let secondModelMixer, secondModelActions = [];*/
let sound, secondSound;
let pillowModel;
/*let pillowMixer;*/
let mixers = []

init();

function init(){

  const assetPath = './';

  clock = new THREE.Clock();
 
  scene = new THREE.Scene();

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('assets/textures/stadium-texture.png',
    function(texture) {
    scene.background = texture;
    scene.environment = envMap;

  });
 
// Camera
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(27.182, 12.045, -1.220);

  // Set up audio for the scene
  const listener = new THREE.AudioListener();
  camera.add(listener);

  sound = new THREE.Audio(listener);
  secondSound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/extras/nfl_theme_song.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false)
    sound.setVolume(1.0);
  });

//Set up renderer for scene
const canvas = document.getElementById('threeContainer');
renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setPixelRatio( window.devicePixelRatio );
resize();

const topLight = new THREE.DirectionalLight(0xFFFFFF, 5);
topLight.position.set(1.7, 4.8, 4);
topLight.target.position.set(0, 0, 0);
scene.add(topLight);
scene.add(topLight.target);

const rightLight = new THREE.PointLight(0xFFFFFF, 0.5, 20);  
rightLight.position.set(4, 0, 0);
scene.add(rightLight);

const sideLight = new THREE.PointLight(0xFFFFFF, 4, 50);  
sideLight.position.set(5, 0, 0);
scene.add(sideLight);

const leftLight = new THREE.PointLight(0xFFFFFF, 3, 50);  
leftLight.position.set(-4, 0, 0);  
scene.add(leftLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x777777, 0.3, 10);
pointLight.position.set(3, 2, 5);
scene.add(pointLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 5, 5);
scene.add(fillLight);


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

// Pillow Button
const addPillowBtn = document.getElementById("addPillow");
addPillowBtn.addEventListener('click', addPillow);

// Trophy Animation
document.getElementById("switchModel").addEventListener('click', function () {
  if (currentModelPath === 'assets/models/superbowl_trophy_animation.glb' && loadedModel) {
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
    loadModel('assets/models/superbowl_trophy.glb', true);
    currentModelPath = 'assets/models/superbowl_trophy_animation.glb';
  }
});

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
    mixers.push(mixerInstance);
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
  
  });
}

//Spin Trophy Button
document.getElementById("btn").addEventListener('click', function () {
  loadModel('assets/models/superbowl_trophy_animation.glb', true);
  currentModelPath = 'assets/models/superbowl_trophy.glb';
});

loadModel('assets/models/superbowl_trophy.glb', true);

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

//Pillow Animation
function addPillow() {
  if(pillowModel) {
    scene.remove(pillowModel);
    pillowModel = null;
    console.log('pillow removed');
    return;
  }

  const pillowLoader = new THREE.GLTFLoader();
  pillowLoader.load('assets/models/pillow_animation_1.glb', function (gltf){
    pillowModel = gltf.scene;
    pillowModel.position.set(0, 0, 0);
    pillowModel.scale.set(1, 1, 1); 
    scene.add(pillowModel);

    console.log('Loaded pillow model:', pillowModel);
   
    if (gltf.animations && gltf.animations.length > 0) {
      console.log('Pillow animations:', gltf.animations);

      const pillowMixer = new THREE.AnimationMixer(pillowModel);
      gltf.animations.forEach((clip) => {
        const action = pillowMixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.reset();
        action.timeScale = 1;
        action.play();
      });

      mixers.push(pillowMixer);

    } else {
      console.warn('No animations found in pillow GLB.');
    }
  }, undefined, function (error) {
    console.error('Error loading pillow:', error);
  });
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  mixers.forEach(m => m.update(delta));


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

