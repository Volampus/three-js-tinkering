import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';

/**
 * Scene setup
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

scene.add(camera);
camera.position.set(0, 0, 10);
// camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({antialias: false});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * Image
 */
// Create a texture loader so we can load our image file
let loader = new THREE.TextureLoader();

const texture = loader.load('textures/sample-background.jpg');
// Increase image sharpness
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
texture.minFilter = THREE.LinearFilter;

// Load an image file into a custom material
let imageMaterial = new THREE.MeshBasicMaterial({
    map: texture
});

// TODO - Update this so that it detects the aspect ratio of the image
// Create a plane geometry for the image with a width of 10
// and a height that preserves the image's aspect ratio
const imageGeometry = new THREE.PlaneGeometry(5 * 2, 10 * .75 * 2);

// Combine our image geometry and material into a mesh
let backgroundMesh = new THREE.Mesh(imageGeometry, imageMaterial);

// Set the position of the image mesh in the x,y,z dimensions
// backgroundMesh.position.set( 0,0,0 )

backgroundMesh.material.depthTest = false;
backgroundMesh.material.depthWrite = false;

// Add the image to the background scene scene
let backgroundScene = new THREE.Scene();
backgroundScene.add(camera);
backgroundScene.add(backgroundMesh);


/**
 * Plane - used for the card, an example of how it can be positioned and rotated is here
 */
const cardGeometry = new THREE.PlaneGeometry(5, 5, 32);
const cardMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
const card = new THREE.Mesh(cardGeometry, cardMaterial);
card.rotation.x = -1;
card.position.y = -6;
// plane.rotation.y = 30;
// plane.rotation.z = 3;
scene.add(card);


/**
 * Cube - used for volume estimation
 */
// Here we are using the segment attributes to improve the wireframe
const cubeGeometry = new THREE.BoxGeometry(3, 3, 3, 5, 5, 5);
const cubeMaterial = new THREE.MeshStandardMaterial({color: 0x9ff9});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeMaterial.wireframe = true;
// Set the rotation of the cube to match the rotation of the plane
cube.rotation.x = card.rotation.x;
cube.rotation.y = card.rotation.y;
cube.rotation.z = card.rotation.z;

scene.add(cube);
// Used when determining which object to apply modifiers to
let activeMesh = cube;
let activeGeometry = cubeGeometry;


/**
 * Hemisphere - used for volume estimation
 */
let hemisphereGeom = new THREE.SphereGeometry(1, 30, 30);
// Remove each vertex that is below the half way point
for (let i = 0; i < hemisphereGeom.vertices.length; i++)
{
    let v = hemisphereGeom.vertices[i];
    if (v.z < 0)
    {
        v.z = 0;
    }
}
hemisphereGeom.computeFaceNormals();
hemisphereGeom.computeVertexNormals();
hemisphereGeom.verticesNeedUpdate = true;


const hemisphereMaterial = new THREE.MeshStandardMaterial({color: 0x9ff9});
const hemisphere = new THREE.Mesh(hemisphereGeom, hemisphereMaterial);
hemisphereMaterial.wireframe = true;
// Set the rotation of the hemisphere to match the rotation of the plane
hemisphere.rotation.x = card.rotation.x;
hemisphere.rotation.y = card.rotation.y;
hemisphere.rotation.z = card.rotation.z;


/**
 * Move on plane - move an object along a plane relative to the orientation of the card
 */
let totalXShift = 0;
let totalYShift = 0;
// Initialise the sliders to be zero
document.getElementById('xSlider').value = 0;
document.getElementById('ySlider').value = 0;
const moveOnXAxis = () =>
{
    // Get the distance by id
    // We divide by 10, giving us 100 increments in the range (-10) - 10
    let distance = document.getElementById('xSlider').value / 10;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    let shiftSize = distance - totalXShift;
    totalXShift += shiftSize;
    // These translate the geometry along its rotated axis
    // console.log(shiftSize);
    activeMesh.translateX(shiftSize);
}
const moveOnYAxis = () =>
{
    // Get the distance by id
    // We divide by 10, giving us 100 increments in the range (-10) - 10
    let distance = document.getElementById('ySlider').value / 10;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    let shiftSize = distance - totalYShift;
    totalYShift += shiftSize;
    // These translate the geometry along its rotated axis
    // console.log(shiftSize);
    activeMesh.translateY(shiftSize);
}
// TODO - Don't think we need a Z slider


/**
 * Scale the object
 */
let totalXScale = 1;
let totalYScale = 1;
let totalZScale = 1;
// Initialise the sliders to be zero
document.getElementById('xScaleSlider').value = 10;
document.getElementById('yScaleSlider').value = 10;
document.getElementById('zScaleSlider').value = 10;
const scaleX = () =>
{
    // Get the scale by id
    // Taking the value from 0 - 100, we can scale up or down by a factor of 10
    let scale = document.getElementById('xScaleSlider').value / 10;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    if (scale !== 0)
    {
        let shiftSize = scale / totalXScale;
        totalXScale *= shiftSize;
        activeGeometry.scale(shiftSize, 1, 1);
    }
}
const scaleY = () =>
{
    // Get the scale by id
    // Taking the value from 0 - 100, we can scale up or down by a factor of 10
    let scale = document.getElementById('yScaleSlider').value / 10;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    if (scale !== 0)
    {
        let shiftSize = scale / totalYScale;
        totalYScale *= shiftSize;
        activeGeometry.scale(1, shiftSize, 1);
    }
}
const scaleZ = () =>
{
    // Get the scale by id
    // Taking the value from 0 - 100, we can scale up or down by a factor of 10
    let scale = document.getElementById('zScaleSlider').value / 10;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    if (scale !== 0)
    {
        let shiftSize = scale / totalZScale;
        totalZScale *= shiftSize;
        activeGeometry.scale(1, 1, shiftSize);
    }
}


/**
 * Dot
 */
const circleGeometry = new THREE.CircleGeometry(0.1, 32);
const circleMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
const circle = new THREE.Mesh(circleGeometry, circleMaterial);
scene.add(circle);


/**
 * Click callbacks
 */
backgroundMesh.name = 'imageMesh';
backgroundMesh.callback = () =>
{
    console.log('mesh clicked');
    // TODO - this is testing
    // moveOnPlane(cube, 1);
}
circle.callback = () =>
{
    console.log('circle clicked');
}


/**
 * Functions to swap active shape
 */
// TODO - reset sliders
const swapToCube = () =>
{
    scene.remove(hemisphere);
    scene.add(cube);
    activeMesh = cube;
    activeGeometry = cubeGeometry;
}

const swapToHemisphere = () =>
{
    scene.remove(cube);
    scene.add(hemisphere);
    activeMesh = hemisphere;
    activeGeometry = hemisphereGeom;
}


/**
 * Click handler
 * https://stackoverflow.com/questions/12800150/catch-the-click-event-on-a-specific-mesh-in-the-renderer
 */
document.getElementById('xSlider').addEventListener('input', moveOnXAxis);
document.getElementById('ySlider').addEventListener('input', moveOnYAxis);

document.getElementById('xScaleSlider').addEventListener('input', scaleX);
document.getElementById('yScaleSlider').addEventListener('input', scaleY);
document.getElementById('zScaleSlider').addEventListener('input', scaleZ);

document.getElementById('cubeButton').addEventListener('click', swapToCube);
document.getElementById('hemisphereButton').addEventListener('click', swapToHemisphere);

let objects = [circle, backgroundMesh]; // Should probably put these in order for what we want to hit first
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const onDocumentMouseDown = (event) =>
{

    // event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0)
    {

        intersects[0].object.callback();

    }

}


document.addEventListener('mousedown', onDocumentMouseDown, false);


/**
 * Lights
 **/

// Add a point light with #fff color, .7 intensity, and 0 distance
let light = new THREE.PointLight(0xffffff, 1, 0);
const backgroundLight = new THREE.AmbientLight(0x404040, 5);
// let backgroundLight = new THREE.PointLight( 0xffffff, 1, 0 );

// Specify the light's position
light.position.set(0, 0, 100);
backgroundLight.position.set(0, 0, 100);

// Add the light to the scene
backgroundScene.add(backgroundLight);
scene.add(light);


/**
 * Animate the scene
 */

// Render the scene in an animate loop
function animate()
{
    requestAnimationFrame(animate);
    // The background is rendered on a separate scene to the objects
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene, camera);
    renderer.render(scene, camera);
}

animate();


