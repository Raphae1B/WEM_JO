// import THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

if (!Modernizr.webgl) alert("Your browser doesn't support WebGL");

var container, stats;
var camera, scene, renderer;
var mouseX = 0,
  mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.y = 400;

  scene = new THREE.Scene();

  var light, object, object2, object3, object4, object5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  light = new THREE.DirectionalLight(0xffffff, 0.2);
  light.position.set(1, 1, 1);
  scene.add(light);

  var material = new THREE.MeshLambertMaterial({ color: 0x0885c2, side: THREE.DoubleSide });
  var material2 = new THREE.MeshLambertMaterial({ color: 0x000000, side: THREE.DoubleSide });
  var material3 = new THREE.MeshLambertMaterial({ color: 0xed334e, side: THREE.DoubleSide });
  var material4 = new THREE.MeshLambertMaterial({ color: 0xfbb132, side: THREE.DoubleSide });
  var material5 = new THREE.MeshLambertMaterial({ color: 0x1c8b3c, side: THREE.DoubleSide });

  object = new THREE.Mesh(new THREE.TorusGeometry(100, 10, 10, 50), material);
  object.position.set(-250, 0, 0);
  scene.add(object);

  object2 = new THREE.Mesh(new THREE.TorusGeometry(100, 10, 10, 50), material2);
  object2.position.set(-10, 0, 5);
  scene.add(object2);

  object3 = new THREE.Mesh(new THREE.TorusGeometry(100, 10, 10, 50), material3);
  object3.position.set(230, 0, 0);
  scene.add(object3);

  object4 = new THREE.Mesh(new THREE.TorusGeometry(100, 10, 10, 50), material4);
  object4.position.set(-125, -100, -5);
  scene.add(object4);

  object5 = new THREE.Mesh(new THREE.TorusGeometry(100, 10, 10, 50), material5);
  object5.position.set(115, -100, 10);
  scene.add(object5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  camera.position.z = 650;

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
