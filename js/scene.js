/**
 * Scene setup
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

scene.add(camera);
camera.position.set( 0, 0, 5 );
// camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 5;
/**
 * Image
 */

// Create a texture loader so we can load our image file
let loader = new THREE.TextureLoader();

// Load an image file into a custom material
let  imageMaterial = new THREE.MeshLambertMaterial({
    map: loader.load('textures/sample-background.jpg')
});

// TODO - Update this so that it detects the aspect ratio of the image
// Create a plane geometry for the image with a width of 10
// and a height that preserves the image's aspect ratio
let planeGeometry = new THREE.PlaneGeometry(10, 10*.75);

// Combine our image geometry and material into a mesh
let imageMesh = new THREE.Mesh( planeGeometry, imageMaterial );

// Set the position of the image mesh in the x,y,z dimensions
imageMesh.position.set( 0,0,0 )

// Add the image to the scene
scene.add( imageMesh );


/**
 * Dot
 */
const circleGeometry = new THREE.CircleGeometry( 0.1, 32 );
const circleMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const circle = new THREE.Mesh( circleGeometry, circleMaterial );
scene.add( circle );


/**
 * Click callbacks
 */
imageMesh.name = 'imageMesh';
imageMesh.callback = () => {
    console.log( 'mesh clicked' );
}
circle.callback = () => {
    console.log( 'circle clicked' );
}

/**
 * Click handler
 * https://stackoverflow.com/questions/12800150/catch-the-click-event-on-a-specific-mesh-in-the-renderer
 */
let objects = [ circle, imageMesh ]; // Should probably put these in order for what we want to hit first
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const onDocumentMouseDown = ( event ) => {

    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( objects );

    if ( intersects.length > 0 ) {

        intersects[0].object.callback();

    }

}


document.addEventListener( 'mousedown', onDocumentMouseDown, false );


/**
 * Lights
 **/

// Add a point light with #fff color, .7 intensity, and 0 distance
let light = new THREE.PointLight( 0xffffff, 1, 0 );

// Specify the light's position
light.position.set( 0, 0, 100 );

// Add the light to the scene
scene.add( light )

/**
 * Animate the scene
 */

// Render the scene in an animate loop
function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();


