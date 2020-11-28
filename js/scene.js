import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';

/**
 * Scene setup
 */
// TODO - fix with rescaling of window - scrollbars also seem to affect detecting input events
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
// This is the dimension ratio of the card taken from my measurements
const cardGeometry = new THREE.PlaneGeometry(8.5 / 2, 5 / 2, 32);
const cardMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
const card = new THREE.Mesh(cardGeometry, cardMaterial);
card.position.y = -3;
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
 * Rotate the plane
 */
const rotatePlaneX = () =>
{
    // Receive input in the range of (-90) - 90
    // Convert to radians
    let rotation = document.getElementById('rotatePlaneX').value * Math.PI / 180;
    // console.log(rotation)
    card.rotation.x = rotation;
    initialiseCube();
}
const rotatePlaneY = () =>
{
    // Receive input in the range of (-90) - 90
    // Convert to radians
    let rotation = document.getElementById('rotatePlaneY').value * Math.PI / 180;
    // console.log(rotation)
    card.rotation.y = rotation;
    initialiseCube();
}
const rotatePlaneZ = () =>
{
    // Receive input in the range of (-90) - 90
    // Convert to radians
    let rotation = document.getElementById('rotatePlaneZ').value * Math.PI / 180;
    // console.log(rotation)
    card.rotation.z = rotation;
    initialiseCube();
}

// Update the Mesh so that it matches the rotation of the card
const updateMeshRotation = () =>
{
    cube.rotation.x = card.rotation.x;
    cube.rotation.y = card.rotation.y;
    cube.rotation.z = card.rotation.z;
    hemisphere.rotation.x = card.rotation.x;
    hemisphere.rotation.y = card.rotation.y;
    hemisphere.rotation.z = card.rotation.z;
}


/**
 * Move the plane
 */
let planeTotalXShift = 0;
let planeTotalYShift = 0;
let planeTotalZShift = 0;
// Initialise the sliders to be zero
document.getElementById('movePlaneX').value = 0;
document.getElementById('movePlaneY').value = 0;
document.getElementById('movePlaneZ').value = 0;
const movePlaneOnXAxis = () =>
{
    // Get the distance by id
    // We divide by 10, giving us 100 increments in the range (-10) - 10
    let distance = document.getElementById('movePlaneX').value / 20;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    let shiftSize = distance - planeTotalXShift;
    planeTotalXShift += shiftSize;
    // These translate the geometry along its rotated axis
    // console.log(shiftSize);
    card.translateX(shiftSize);
}
const movePlaneOnYAxis = () =>
{
    // Get the distance by id
    // We divide by 10, giving us 100 increments in the range (-10) - 10
    let distance = document.getElementById('movePlaneY').value / 20;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    let shiftSize = distance - planeTotalYShift;
    planeTotalYShift += shiftSize;
    // These translate the geometry along its rotated axis
    // console.log(shiftSize);
    card.translateY(shiftSize);
}
const movePlaneOnZAxis = () =>
{
    // Get the distance by id
    // We divide by 10, giving us 100 increments in the range (-10) - 10
    let distance = document.getElementById('movePlaneZ').value / 20;
    // console.log('value: ' + distance);
    // Make this work as absolute rather than relative movement
    let shiftSize = distance - planeTotalZShift;
    planeTotalZShift += shiftSize;
    // These translate the geometry along its rotated axis
    // console.log(shiftSize);
    card.translateZ(shiftSize);

    // // TODO - remove
    // var box = new THREE.Box3().setFromObject( card );
    // console.log(box.getSize(new THREE.Vector3(0, 0, 0)) );
}


/**
 * Initialise Estimation Objects
 */
const initialiseCube = () =>
{
    cardGeometry.computeBoundingBox();
    let center = new THREE.Vector3(0, 0, 0);
    cardGeometry.boundingBox.getCenter(center);
    // console.log('local center: ' + JSON.stringify(center))
    card.localToWorld(center);
    // console.log('global center: ' + JSON.stringify(center));
    cube.position.x = card.position.x;
    cube.position.y = card.position.y;
    cube.position.z = card.position.z;

    cube.rotation.x = card.rotation.x;
    cube.rotation.y = card.rotation.y;
    cube.rotation.z = card.rotation.z;

    cube.translateZ(1.5);
}


/**
 * Dot
 * TODO - testing
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
    initialiseCube();
    activeMesh = cube;
    activeGeometry = cubeGeometry;
}

const swapToHemisphere = () =>
{
    scene.remove(cube);
    scene.add(hemisphere);
    // TODO - initialise
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

document.getElementById('rotatePlaneX').addEventListener('input', rotatePlaneX);
document.getElementById('rotatePlaneY').addEventListener('input', rotatePlaneY);
document.getElementById('rotatePlaneZ').addEventListener('input', rotatePlaneZ);

document.getElementById('movePlaneX').addEventListener('input', movePlaneOnXAxis);
document.getElementById('movePlaneY').addEventListener('input', movePlaneOnYAxis);
document.getElementById('movePlaneZ').addEventListener('input', movePlaneOnZAxis);


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
 * Matrix Manipulation - TODO - export to separate js file
 */
function adj(m) { // Compute the adjugate of m
    return [
        m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
        m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
        m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
    ];
}
function multmm(a, b) { // multiply two matrices
    var c = Array(9);
    for (var i = 0; i != 3; ++i) {
        for (var j = 0; j != 3; ++j) {
            var cij = 0;
            for (var k = 0; k != 3; ++k) {
                cij += a[3*i + k]*b[3*k + j];
            }
            c[3*i + j] = cij;
        }
    }
    return c;
}
function multmv(m, v) { // multiply matrix and vector
    return [
        m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
        m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
        m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
    ];
}
function pdbg(m, v) {
    var r = multmv(m, v);
    return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
}
function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m = [
        x1, x2, x3,
        y1, y2, y3,
        1,  1,  1
    ];
    var v = multmv(adj(m), [x4, y4, 1]);
    return multmm(m, [
        v[0], 0, 0,
        0, v[1], 0,
        0, 0, v[2]
    ]);
}
function general2DProjection(
    x1s, y1s, x1d, y1d,
    x2s, y2s, x2d, y2d,
    x3s, y3s, x3d, y3d,
    x4s, y4s, x4d, y4d
) {
    var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
    var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
    return multmm(d, adj(s));
}
function project(m, x, y) {
    var v = multmv(m, [x, y, 1]);
    return [v[0]/v[2], v[1]/v[2]];
}

let t = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];

function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
    // These sizes are fixed as the size of the virtual card is fixed
    var w = 2, h = 2;
    t = general2DProjection
    (0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
    for(let i = 0; i != 9; ++i) t[i] = t[i]/t[8];
    t = [t[0], t[3], 0, t[6],
        t[1], t[4], 0, t[7],
        0   , 0   , 1, 0   ,
        t[2], t[5], 0, t[8]];

    // Setup the THREE matrix
    // m = new THREE.Matrix4();
    //
    // m.set( t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]);

    console.log(sampleCard.matrixWorld)


    console.log('new matrix: ' + JSON.stringify(sampleCard.matrix))
    console.log('new matrixWorld: ' + JSON.stringify(sampleCard.matrixWorld))
    console.log('t: ' + t);
    // t = "matrix3d(" + t.join(", ") + ")";
    // elt.style["-webkit-transform"] = t;
    // elt.style["-moz-transform"] = t;
    // elt.style["-o-transform"] = t;
    // elt.style.transform = t;
}
// TODO - Get these corners from somewhere
let corners = [2, 2, 4, 2, 2, 4, 4, 4];
// Add a sample card to the scene that matches these dimensions
// This is the dimension ratio of the card taken from my measurements
const sampleCardGeometry = new THREE.PlaneGeometry(2, 2, 32);
const sampleCardMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
sampleCardMaterial.wireframe = true;
const sampleCard = new THREE.Mesh(sampleCardGeometry, sampleCardMaterial);
sampleCard.position.x = 2;
sampleCard.position.y = 2;
sampleCard.matrixAutoUpdate = false
// plane.rotation.y = 30;
// plane.rotation.z = 3;
scene.add(sampleCard);

//-----------------------------------
function update() {
    transform2d(card, corners[0], corners[1], corners[2], corners[3],
        corners[4], corners[5], corners[6], corners[7]);
    // for (var i = 0; i != 8; i += 2) {
    //     var elt = document.getElementById("marker" + i);
    //     elt.style.left = corners[i] + "px";
    //     elt.style.top = corners[i + 1] + "px";
    // }
}
// function move(evnt) {
//     if (currentcorner < 0) return;
//     corners[currentcorner] = evnt.pageX;
//     corners[currentcorner + 1] = evnt.pageY;
//     update();
// }
// let currentcorner = -1;

update(); // Call it first off

// Call the update script when button clicked
document.getElementById('updatePlane').addEventListener('click', update);

// window.addEventListener('load', function() {
//     document.documentElement.style.margin="0px";
//     document.documentElement.style.padding="0px";
//     document.body.style.margin="0px";
//     document.body.style.padding="0px";
//     update();
// });
// window.addEventListener('mousedown', function(evnt) {
//     var x = evnt.pageX, y = evnt.pageY, dx, dy;
//     var best = 400; // 20px grab radius
//     currentcorner = -1;
//     for (var i = 0; i != 8; i += 2) {
//         dx = x - corners[i];
//         dy = y - corners[i + 1];
//         if (best > dx*dx + dy*dy) {
//             best = dx*dx + dy*dy;
//             currentcorner = i;
//         }
//     }
//     move(evnt);
// });
// window.addEventListener('mouseup', function(evnt) {
//     currentcorner = -1;
// })
// window.addEventListener('mousemove', move);


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
    sampleCard.matrix.set( t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]);
}

animate();


