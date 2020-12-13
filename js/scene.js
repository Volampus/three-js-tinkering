import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js'

/**
 * Scene setup
 */
// TODO - fix with rescaling of window - scrollbars also seem to affect detecting input events
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

scene.add(camera)
camera.position.set(0, 0, 10)
// camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: false })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

/**
 * Image
 */
// Create a texture loader so we can load our image file
let loader = new THREE.TextureLoader()

const texture = loader.load('textures/sample-background.jpg')
// Increase image sharpness
texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
texture.minFilter = THREE.LinearFilter

// Load an image file into a custom material
let imageMaterial = new THREE.MeshBasicMaterial({
  map: texture,
})

let backgroundScene = new THREE.Scene()

// Calculate the aspect ration of the image
let backgroundImage = new Image()
backgroundImage.src = 'textures/sample-background.jpg'

backgroundImage.onload = () => {
  let widthMultiple = 10 / backgroundImage.width
  let height = backgroundImage.height * widthMultiple

  // Create a plane geometry for the image with a width of 10
  // and a height that preserves the image's aspect ratio
  const imageGeometry = new THREE.PlaneGeometry(10, height)

  // Combine our image geometry and material into a mesh
  let backgroundMesh = new THREE.Mesh(imageGeometry, imageMaterial)

  backgroundMesh.material.depthTest = false
  backgroundMesh.material.depthWrite = false

  // Add the image to the background scene scene
  backgroundScene.add(camera)
  backgroundScene.add(backgroundMesh)
}

/**
 * Plane - used for the card, an example of how it can be positioned and rotated is here
 */
// This is the dimension ratio of the card taken from my measurements
const cardGeometry = new THREE.PlaneGeometry(8.5, 5, 32, 32)
const cardMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
const card = new THREE.Mesh(cardGeometry, cardMaterial)
card.scale.set(0.5, 0.5)
card.position.y = -3
// plane.rotation.y = 30;
// plane.rotation.z = 3;
scene.add(card)

/**
 * Plane - used for collision detection
 * This plane is matched to the orientation of the card but covers the whole screen for collision detection
 */
// const collisionGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
// const collisionMaterial = new THREE.MeshBasicMaterial({transparent: true, side: THREE.DoubleSide});
// const collisionPlane = new THREE.Mesh(collisionGeometry, collisionMaterial);
// collisionPlane.position.y = -3;
// // plane.rotation.y = 30;
// // plane.rotation.z = 3;
// scene.add(collisionPlane);

/**
 * Cube - used for volume estimation
 */
// Create a container for the cube
const cubeContainer = new THREE.Object3D()
// Here we are using the segment attributes to improve the wireframe
const cubeGeometry = new THREE.BoxGeometry(3 / 2.5, 3 / 2.5, 3 / 2.5, 5, 5, 5)
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x9ff9 })
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
cubeMesh.scale.set(2.5, 2.5, 2.5)
cubeMaterial.wireframe = true
// Set the rotation of the cube to match the rotation of the plane
cubeMesh.rotation.x = card.rotation.x
cubeMesh.rotation.y = card.rotation.y
cubeMesh.rotation.z = card.rotation.z

// cubeContainer.add(cube);
// scene.add(cubeMesh)

/**
 * Hemisphere - used for volume estimation
 */
let hemisphereGeom = new THREE.SphereGeometry(3, 20, 20)
// Remove each vertex that is below the half way point
for (let i = 0; i < hemisphereGeom.vertices.length; i++) {
  let v = hemisphereGeom.vertices[i]
  if (v.z < 0) {
    v.z = 0
  }
}
hemisphereGeom.computeFaceNormals()
hemisphereGeom.computeVertexNormals()
hemisphereGeom.verticesNeedUpdate = true

const hemisphereMaterial = new THREE.MeshStandardMaterial({ color: 0x9ff9 })
const hemisphereMesh = new THREE.Mesh(hemisphereGeom, hemisphereMaterial)
hemisphereMaterial.wireframe = true
// Set the rotation of the hemisphere to match the rotation of the plane
hemisphereMesh.rotation.x = card.rotation.x
hemisphereMesh.rotation.y = card.rotation.y
hemisphereMesh.rotation.z = card.rotation.z

/**
 * Store data about each object in an array
 */
let objectProperties = {
  active: null,
  cube: {
    name: 'cube',
    geom: cubeGeometry,
    mesh: cubeMesh,
    totalXShift: 0,
    totalYShift: 0,
  },
  hemi: {
    name: 'hemi',
    geom: hemisphereGeom,
    mesh: hemisphereMesh,
    totalXShift: 0,
    totalYShift: 0,
  },
}
objectProperties.active = objectProperties.cube

/**
 * Move on plane - move an object along a plane relative to the orientation of the card
 */
// Initialise the sliders to be zero
parent.document.getElementById('xSlider').value = 0
parent.document.getElementById('ySlider').value = 0
const moveOnXAxis = () => {
  // Get the distance by id
  // We divide by 10, giving us 100 increments in the range (-10) - 10
  let distance = parent.document.getElementById('xSlider').value / 10
  // console.log('value: ' + distance);
  // Make this work as absolute rather than relative movement
  let shiftSize = distance - objectProperties.active.totalXShift
  objectProperties.active.totalXShift += shiftSize

  // Move globally along the x axis
  objectProperties.active.mesh.translateX(shiftSize)

  // activeMesh.position.z -= Math.tan(card.rotation.y) * shiftSize

  // TODO - This works, but is kinda inefficient
  /*
    activeMesh.updateMatrixWorld()

    const downDirectionVector = new THREE.Vector3(0, 0, -1)
    let extractedRotation = new THREE.Matrix4()
    console.log('meshs rotation')
    const a = new THREE.Euler( activeMesh.rotation.x, activeMesh.rotation.y, activeMesh.rotation.z, 'XYZ' );
    extractedRotation.makeRotationFromEuler( a )
    console.log('rotation')
    console.log(extractedRotation)
    downDirectionVector.applyMatrix4( extractedRotation )
    console.log( downDirectionVector )

    const upTranslationVector = new THREE.Vector3(0, 0, 1.5)
    upTranslationVector.applyMatrix4( extractedRotation )

    let collision = false

    // let localVertex = new THREE.Vector3(activeMesh.position.x, activeMesh.position.y, activeMesh.position.z)
    // let globalVertex = localVertex.applyMatrix4(activeMesh.matrix);
    // let directionVector = globalVertex.sub(activeMesh.position);
    // console.log(collisionPlane.rotation.x)

    // let centerBase = new THREE.Vector3(activeMesh.position.x, activeMesh.position.y, activeMesh.position.z)
    // console.log( centerBase );

    let target = new THREE.Vector3();
    // console.log(activeMesh.position.x)
    activeMesh.getWorldPosition( target );
    // console.log(target)

    // let centerTarget = new THREE.Vector3();
    // activeGeometry.computeBoundingBox();
    // activeGeometry.boundingBox.getCenter( centerTarget );
    // // console.log( centerTarget );
    // activeMesh.localToWorld( centerTarget );
    // console.log( centerTarget );

    console.log(upTranslationVector.length())

    let ray = new THREE.Raycaster(target, downDirectionVector.clone().normalize());
    let collisionResults = ray.intersectObjects([collisionPlane]);
    if (collisionResults.length > 0)
    {

        // a collision occurred... do something...
        console.log(collisionResults[0].point)
        console.log(upTranslationVector)
        activeMesh.position.copy( collisionResults[0].point ).add( upTranslationVector )  //.add( collisionResults[0].face.normal );
        console.log(activeMesh.position)
        collision = true;
    }

    if (!collision)
    {
        console.log('no collision!!!!!!');
    }*/

  // These translate the geometry along its rotated axis
  // console.log(shiftSize);
  // activeMesh.translateX(shiftSize)
  // let yRotationPercent = activeMesh.rotation.y / (Math.PI / 2);
  // let zRotationPercent = activeMesh.rotation.z / (Math.PI / 2);
  // console.log(activeMesh.rotation.z)
  // console.log(zRotationPercent)
  // activeMesh.translateY(-(shiftSize * zRotationPercent));
  // // console.log(-(shiftSize * zRotationPercent))
  // // console.log(shiftSize * (1 - zRotationPercent))
  // activeMesh.translateX(shiftSize * (1 - Math.abs(zRotationPercent)));
  // let zRotationTangent = Math.tan(activeMesh.rotation.z)
  // if (zRotationTangent !== 0 ){
  //     activeMesh.translateY( zRotationTangent * shiftSize )
  //     activeMesh.translateX( shiftSize / zRotationTangent )
  // }
  // else {
  //     activeMesh.translateX( shiftSize )
  // }
}
const moveOnYAxis = () => {
  // Get the distance by id
  // We divide by 10, giving us 100 increments in the range (-10) - 10
  let distance = parent.document.getElementById('ySlider').value / 10
  // console.log('value: ' + distance);
  // Make this work as absolute rather than relative movement
  let shiftSize = distance - objectProperties.active.totalYShift
  objectProperties.active.totalYShift += shiftSize
  // These translate the geometry along its rotated axis
  // console.log(shiftSize);
  objectProperties.active.mesh.translateY(shiftSize)
}
// Move one increment based on keypress
const incrementOnXAxis = (i) => {
  // Move the element
  let shiftSize = i / 10
  objectProperties.active.totalXShift += shiftSize
  objectProperties.active.mesh.translateX(shiftSize)
  // Update the slider
  parent.document.getElementById('xSlider').value = objectProperties.active.totalXShift * 10
}
// Move one increment based on keypress
const incrementOnYAxis = (i) => {
  // Move the element
  let shiftSize = i / 10
  objectProperties.active.totalYShift += shiftSize
  objectProperties.active.mesh.translateY(shiftSize)
  // Update the slider
  parent.document.getElementById('ySlider').value = objectProperties.active.totalYShift * 10
}

const moveOnKeydown = (e) => {
  const key = e.key || e.keyCode
  switch (key) {
    case 'a':
      incrementOnXAxis(-1)
      break
    case 'd':
      incrementOnXAxis(1)
      break
    case 'w':
      incrementOnYAxis(1)
      break
    case 's':
      incrementOnYAxis(-1)
      break
  }
}

/**
 * Calculate the volume
 */
const calculateVolume = () => {
  let volume = 0
  if (objectProperties.active.name === 'cube') {
    // Scale * original size * two (the card is at half scale)
    let xSize = objectProperties.active.mesh.scale.x * (3 / 2.5) * 2
    let ySize = objectProperties.active.mesh.scale.y * (3 / 2.5) * 2
    let zSize = objectProperties.active.mesh.scale.z * (3 / 2.5) * 2
    volume = xSize * ySize * zSize
  }
  // Set it in the DOM
  parent.document.getElementById('volume').textContent = volume.toString()
}

/**
 * Scale the object
 */
// Initialise the sliders to be zero
parent.document.getElementById('xScaleSlider').value = 50
parent.document.getElementById('yScaleSlider').value = 50
parent.document.getElementById('zScaleSlider').value = 50
const scaleX = () => {
  // Get the scale by id
  // Taking the value from 0 - 100, we can scale up or down by a factor of 5
  let scale = parent.document.getElementById('xScaleSlider').value / 20
  objectProperties.active.xScale = scale
  objectProperties.active.mesh.scale.setX(scale)
  calculateVolume()
}
const scaleY = () => {
  // Get the scale by id
  // Taking the value from 0 - 100, we can scale up or down by a factor of 5
  let scale = parent.document.getElementById('yScaleSlider').value / 20
  objectProperties.active.mesh.scale.setY(scale)
  calculateVolume()
}
const scaleZ = () => {
  // Get the scale by id
  // Taking the value from 0 - 100, we can scale up or down by a factor of 5
  let scale = parent.document.getElementById('zScaleSlider').value / 20
  objectProperties.active.mesh.scale.setZ(scale)
  // TODO - need to translate Z so that the base stays on rescale
  calculateVolume()
}
const resetScale = () => {
  parent.document.getElementById('xScaleSlider').value = 50
  parent.document.getElementById('yScaleSlider').value = 50
  parent.document.getElementById('zScaleSlider').value = 50

  objectProperties.active.mesh.scale.set(2.5, 2.5, 2.5)
  calculateVolume()
}

/**
 * Rotate the plane - this is a world coordinate rotation
 */
// Initialise the sliders to be zero
parent.document.getElementById('rotatePlaneX').value = 0
parent.document.getElementById('rotatePlaneY').value = 0
parent.document.getElementById('rotatePlaneZ').value = 0
const rotatePlaneX = () => {
  // Receive input in the range of (-90) - 90
  // Convert to radians
  let rotation = (parent.document.getElementById('rotatePlaneX').value * Math.PI) / 180
  // console.log(rotation)
  card.rotation.x = rotation
  // collisionPlane.rotation.x = rotation;
  initialiseObjects('cube')
  initialiseObjects('hemi')
}
const rotatePlaneY = () => {
  // Receive input in the range of (-90) - 90
  // Convert to radians
  let rotation = (parent.document.getElementById('rotatePlaneY').value * Math.PI) / 180
  // console.log(rotation)
  card.rotation.y = rotation
  // collisionPlane.rotation.y = rotation;
  initialiseObjects('cube')
  initialiseObjects('hemi')
}
const rotatePlaneZ = () => {
  // Receive input in the range of (-90) - 90
  // Convert to radians
  let rotation = (parent.document.getElementById('rotatePlaneZ').value * Math.PI) / 180
  // console.log(rotation)
  card.rotation.z = rotation
  // collisionPlane.rotation.z = rotation;
  initialiseObjects('cube')
  initialiseObjects('hemi')
}

/**
 * Move the plane
 */
let planeTotalXShift = 0
let planeTotalYShift = 0
let planeTotalZShift = 0
// Initialise the sliders to be zero
parent.document.getElementById('movePlaneX').value = 0
parent.document.getElementById('movePlaneY').value = 0
parent.document.getElementById('movePlaneZ').value = 0
const movePlaneOnXAxis = () => {
  // Get the distance by id
  // We divide by 10, giving us 100 increments in the range (-10) - 10
  let distance = parent.document.getElementById('movePlaneX').value / 20
  // console.log('value: ' + distance);
  // Make this work as absolute rather than relative movement
  let shiftSize = distance - planeTotalXShift
  planeTotalXShift += shiftSize
  // These translate the geometry along its rotated axis
  // console.log(shiftSize);
  card.translateX(shiftSize)
}
const movePlaneOnYAxis = () => {
  // Get the distance by id
  // We divide by 10, giving us 100 increments in the range (-10) - 10
  let distance = parent.document.getElementById('movePlaneY').value / 20
  // console.log('value: ' + distance);
  // Make this work as absolute rather than relative movement
  let shiftSize = distance - planeTotalYShift
  planeTotalYShift += shiftSize
  // These translate the geometry along its rotated axis
  // console.log(shiftSize);
  card.translateY(shiftSize)
}
const movePlaneOnZAxis = () => {
  // Get the distance by id
  // We divide by 10, giving us 100 increments in the range (-10) - 10
  let distance = parent.document.getElementById('movePlaneZ').value / 20
  // console.log('value: ' + distance);
  // Make this work as absolute rather than relative movement
  let shiftSize = distance - planeTotalZShift
  planeTotalZShift += shiftSize
  // These translate the geometry along its rotated axis
  // console.log(shiftSize);
  card.translateZ(shiftSize)
}

/**
 * Initialise Estimation Objects
 */
const initialiseObjects = (objectType) => {
  objectProperties[objectType].mesh.position.x = card.position.x
  objectProperties[objectType].mesh.position.y = card.position.y
  objectProperties[objectType].mesh.position.z = card.position.z

  objectProperties[objectType].mesh.rotation.x = card.rotation.x
  objectProperties[objectType].mesh.rotation.y = card.rotation.y
  objectProperties[objectType].mesh.rotation.z = card.rotation.z

  if (objectType === 'cube') {
    objectProperties[objectType].mesh.translateZ(1.5)
  }
}

/**
 * Dot
 * TODO - testing
 */
const circleGeometry = new THREE.CircleGeometry(0.1, 32)
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const circle = new THREE.Mesh(circleGeometry, circleMaterial)
scene.add(circle)

/**
 * Click callbacks
 */
// backgroundMesh.name = 'imageMesh';
// backgroundMesh.callback = () =>
// {
//     console.log('mesh clicked');
//     // TODO - this is testing
//     // moveOnPlane(cube, 1);
// }
circle.callback = () => {
  console.log('circle clicked')
}

/**
 * Functions to swap active shape
 */
const swapToCube = () => {
  scene.remove(hemisphereMesh)
  scene.add(cubeMesh)
  parent.document.getElementById('xSlider').value = objectProperties.cube.totalXShift * 10
  parent.document.getElementById('ySlider').value = objectProperties.cube.totalYShift * 10
  parent.document.getElementById('xScaleSlider').value = objectProperties.cube.totalXScale * 10
  parent.document.getElementById('yScaleSlider').value = objectProperties.cube.totalYScale * 10
  parent.document.getElementById('zScaleSlider').value = objectProperties.cube.totalZScale * 10
  objectProperties.active = objectProperties.cube
  calculateVolume()
}

const swapToHemisphere = () => {
  scene.remove(cubeMesh)
  scene.add(hemisphereMesh)
  parent.document.getElementById('xSlider').value = objectProperties.hemi.totalXShift * 10
  parent.document.getElementById('ySlider').value = objectProperties.hemi.totalYShift * 10
  parent.document.getElementById('xScaleSlider').value = objectProperties.hemi.totalXScale * 10
  parent.document.getElementById('yScaleSlider').value = objectProperties.hemi.totalYScale * 10
  parent.document.getElementById('zScaleSlider').value = objectProperties.hemi.totalZScale * 10
  objectProperties.active = objectProperties.hemi
  calculateVolume()
}

/**
 * Proceed to the volume estimation
 */
const proceedToEstimation = () => {
  initialiseObjects('cube')
  initialiseObjects('hemi')
  swapToCube()
  parent.document.getElementById('plane').style.display = 'none'
  parent.document.getElementById('estimation').style.display = 'block'
}

/**
 * Click handler
 * https://stackoverflow.com/questions/12800150/catch-the-click-event-on-a-specific-mesh-in-the-renderer
 */
parent.document.getElementById('xSlider').addEventListener('input', moveOnXAxis)
parent.document.getElementById('ySlider').addEventListener('input', moveOnYAxis)

parent.document.getElementById('xScaleSlider').addEventListener('input', scaleX)
parent.document.getElementById('yScaleSlider').addEventListener('input', scaleY)
parent.document.getElementById('zScaleSlider').addEventListener('input', scaleZ)
parent.document.getElementById('resetScale').addEventListener('click', resetScale)

parent.document.getElementById('rotatePlaneX').addEventListener('input', rotatePlaneX)
parent.document.getElementById('rotatePlaneY').addEventListener('input', rotatePlaneY)
parent.document.getElementById('rotatePlaneZ').addEventListener('input', rotatePlaneZ)

parent.document.getElementById('movePlaneX').addEventListener('input', movePlaneOnXAxis)
parent.document.getElementById('movePlaneY').addEventListener('input', movePlaneOnYAxis)
parent.document.getElementById('movePlaneZ').addEventListener('input', movePlaneOnZAxis)

parent.document.getElementById('cubeButton').addEventListener('click', swapToCube)
parent.document.getElementById('hemisphereButton').addEventListener('click', swapToHemisphere)

parent.document.getElementById('proceed').addEventListener('click', proceedToEstimation)

// Listeners for keyboard controls
parent.document.addEventListener('keydown', (event) => {
  event.preventDefault() // Prevent the browser from doing other stuff like ctrl+f
  moveOnKeydown(event)
})
document.addEventListener('keydown', (event) => {
  event.preventDefault()
  moveOnKeydown(event)
})

let objects = [circle] // Should probably put these in order for what we want to hit first
let raycaster = new THREE.Raycaster()
let mouse = new THREE.Vector2()

const onDocumentMouseDown = (event) => {
  // event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  let intersects = raycaster.intersectObjects(objects)

  if (intersects.length > 0) {
    intersects[0].object.callback()
  }
}

document.addEventListener('mousedown', onDocumentMouseDown, false)

/**
 * Lights
 **/

// Add a point light with #fff color, .7 intensity, and 0 distance
let light = new THREE.PointLight(0xffffff, 1, 0)
const backgroundLight = new THREE.AmbientLight(0x404040, 5)
// let backgroundLight = new THREE.PointLight( 0xffffff, 1, 0 );

// Specify the light's position
light.position.set(0, 0, 100)
backgroundLight.position.set(0, 0, 100)

// Add the light to the scene
backgroundScene.add(backgroundLight)
scene.add(light)

/**
 * Animate the scene
 */

// Render the scene in an animate loop
function animate() {
  requestAnimationFrame(animate)
  // The background is rendered on a separate scene to the objects
  renderer.autoClear = false
  renderer.clear()
  renderer.render(backgroundScene, camera)
  renderer.render(scene, camera)
}

animate()

/**
 * Handle iframe resizes
 */
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)
