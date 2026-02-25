// === Импорты ===
import * as THREE from "https://unpkg.com/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://unpkg.com/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.129.0/examples/jsm/loaders/RGBELoader.js";

// === Сцена и камера ===
const scene = new THREE.Scene();
const container = document.getElementById("container3D");
const width = container.clientWidth;
const height = container.clientHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// HDR фон и окружение
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

function setHDREnvironment(hdrFile) {
  new RGBELoader()
    .setPath("./models/")
    .load(hdrFile, function (texture) {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      pmremGenerator.dispose();

      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;

      scene.background = texture;
    });
}

// === Кнопки ===
const dayBtn = document.getElementById("DayBtn");
const nightBtn = document.getElementById("NightBtn");
const wireframeBtn = document.getElementById("wireframeBtn");
const NotBtn = document.getElementById("NotBtn");
const leftDoorBtn = document.getElementById("leftDoorBtn");
const rightDoorBtn = document.getElementById("rightDoorBtn");
const hoodBtn = document.getElementById("hoodBtn");
const trunkBtn = document.getElementById("trunkBtn");
const pollymodel = document.getElementById("pollymodel");

// Управление камерой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.target.set(0, 0, 0);

// === Загрузка модели с DRACO ===
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
loader.setDRACOLoader(dracoLoader);

const loaderElement = document.getElementById("loader");
let object;
let mixer;
const actions = {};
let usingOptimized = true;

// Состояния дверей и капота
let hoodOpen = false;
let leftDoorOpen = false;
let rightDoorOpen = false;
let trunkOpen = false;

loader.load("./models/car_opt.glb", function (gltf) {
  object = gltf.scene;
  scene.add(object);

  loaderElement.style.display = "none";

  object.traverse((child) => {
    if (child.isMesh) child.material.wireframe = false;
  });

  // Анимации
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(object);
    gltf.animations.forEach((clip) => {
      actions[clip.name] = mixer.clipAction(clip);
    });
    console.log("Анимации:", Object.keys(actions));
  }

  // Центрирование модели
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  camera.position.set(2.0165, 0.5727, 2.515);
  controls.target.set(-0.4279, 0.0143, 0.5031);
  controls.update();
  
});

// === Функции анимаций ===
function playPair(action, pair) {
  for (const key of pair) {
    if (actions[key] && actions[key] !== action) actions[key].fadeOut(0.2);
  }
  action.reset();
  action.enabled = true;
  action.setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.timeScale = 1;
  action.fadeIn(0.2).play();
}

// Управление дверями и капотом
leftDoorBtn.addEventListener("click", () => {
  if (!actions["dl_o"] || !actions["dl_c"]) return;
  if (!leftDoorOpen) { playPair(actions["dl_o"], ["dl_o","dl_c"]); leftDoorOpen=true; leftDoorBtn.classList.add("active-btn"); } 
  else { playPair(actions["dl_c"], ["dl_o","dl_c"]); leftDoorOpen=false; leftDoorBtn.classList.remove("active-btn"); }
});

rightDoorBtn.addEventListener("click", () => {
  if (!actions["dr_o"] || !actions["dr_c"]) return;
  if (!rightDoorOpen) { playPair(actions["dr_o"], ["dr_o","dr_c"]); rightDoorOpen=true; rightDoorBtn.classList.add("active-btn"); } 
  else { playPair(actions["dr_c"], ["dr_o","dr_c"]); rightDoorOpen=false; rightDoorBtn.classList.remove("active-btn"); }
});

hoodBtn.addEventListener("click", () => {
  if (!actions["h_o"] || !actions["h_c"]) return;
  if (!hoodOpen) { playPair(actions["h_o"], ["h_o","h_c"]); hoodOpen=true; hoodBtn.classList.add("active-btn"); } 
  else { playPair(actions["h_c"], ["h_o","h_c"]); hoodOpen=false; hoodBtn.classList.remove("active-btn"); }
});

trunkBtn.addEventListener("click", () => {
  if (!actions["t_o"] || !actions["t_c"]) return;
  if (!trunkOpen) { playPair(actions["t_o"], ["t_o","t_c"]); trunkOpen=true; trunkBtn.classList.add("active-btn"); } 
  else { playPair(actions["t_c"], ["t_o","t_c"]); trunkOpen=false; trunkBtn.classList.remove("active-btn"); }
});

NotBtn.addEventListener("click", () => {
  if (leftDoorOpen && actions["dl_c"]) { playPair(actions["dl_c"], ["dl_o","dl_c"]); leftDoorOpen=false; leftDoorBtn.classList.remove("active-btn"); }
  if (rightDoorOpen && actions["dr_c"]) { playPair(actions["dr_c"], ["dr_o","dr_c"]); rightDoorOpen=false; rightDoorBtn.classList.remove("active-btn"); }
  if (hoodOpen && actions["h_c"]) { playPair(actions["h_c"], ["h_o","h_c"]); hoodOpen=false; hoodBtn.classList.remove("active-btn"); }
  if (trunkOpen && actions["t_c"]) { playPair(actions["t_c"], ["t_o","t_c"]); trunkOpen=false; trunkBtn.classList.remove("active-btn"); }
});

let currentLoad = null;

function loadModel(path) {
  loaderElement.style.display = "flex";

  // удаляем старый объект сразу
  if (object) {
    scene.remove(object);
    object.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
    object = null;
  }

  const thisLoad = loader.load(path, function (gltf) {
    // если во время загрузки пользователь кликнул и загрузился другой файл
    if (currentLoad !== thisLoad) return;

    object = gltf.scene;
    scene.add(object);

    object.traverse((child) => {
      if (child.isMesh) child.material.wireframe = wireframeMode;
    });

    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(object);
      for (const key in actions) delete actions[key];
      gltf.animations.forEach((clip) => {
        actions[clip.name] = mixer.clipAction(clip);
      });
    }

    function forceState(open, openActionName, closeActionName) {
      if (!actions[openActionName] || !actions[closeActionName]) return;
      const action = open ? actions[openActionName] : actions[closeActionName];
      action.reset();
      action.enabled = true;
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.time = action.getClip().duration;
      action.play();
    }

    forceState(leftDoorOpen, "dl_o", "dl_c");
    forceState(rightDoorOpen, "dr_o", "dr_c");
    forceState(hoodOpen, "h_o", "h_c");
    forceState(trunkOpen, "t_o", "t_c");

    loaderElement.style.display = "none";
  });

  currentLoad = thisLoad;
}

// === переключатель моделей ===
let pollymodelMode = false;
pollymodel.addEventListener("click", () => {
  pollymodelMode = !pollymodelMode;
  if (usingOptimized) {
    loadModel("./models/car.gltf");   // грузим обычную
  } else {
    loadModel("./models/car_opt.glb"); // возвращаем оптимизированную
  }
  usingOptimized = !usingOptimized;

  // обновляем надпись на кнопке Wireframe
  pollymodel.textContent = pollymodelMode ? "On" : "Off";
});


// === Смена HDR ===
function setActiveButton(activeBtn) {
  dayBtn.classList.remove("active-b");
  nightBtn.classList.remove("active-b");
  activeBtn.classList.add("active-b");
}

dayBtn.addEventListener("click", () => { setHDREnvironment("countrytrax_midday_4k.hdr"); setActiveButton(dayBtn); });
nightBtn.addEventListener("click", () => { setHDREnvironment("moonless_golf_4k.hdr"); setActiveButton(nightBtn); });

// === Wireframe ===
let wireframeMode = false;
wireframeBtn.addEventListener("click", () => {
  wireframeMode = !wireframeMode;
  if(object) object.traverse(child => { if(child.isMesh) child.material.wireframe = wireframeMode; });
  wireframeBtn.textContent = wireframeMode ? "On" : "Off";
});

// === Анимация сцены ===
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// === Обработка изменения размеров окна ===
window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) return; // на мобильных пропускаем

  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// === Загрузка изначального HDR ===
setHDREnvironment("countrytrax_midday_4k.hdr");
setActiveButton(dayBtn);
wireframeBtn.classList.add("active-b");
NotBtn.classList.add("active-b");
