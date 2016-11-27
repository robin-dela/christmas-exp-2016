import { Mesh, SphereGeometry, ShaderMaterial, Vector3, Quaternion, Euler } from 'three'
import ThreejsTextureTool from 'threejs-texture-tool'
import { toRadians } from '../core/utils';


import props from '../core/props';

const glslify = require( 'glslify' )

const vertexShader = glslify( '../shaders/sphere-vs.glsl' )
const fragmentShader = glslify( '../shaders/sphere-fs.glsl' )


export default class Sphere extends Mesh {
  constructor() {
    const geometry = new SphereGeometry( 100, 30, 30 )
    const textureTool = new ThreejsTextureTool();

    const biomeTextureTool = textureTool.createImageTexture('assets/images/biome.jpg', 'Biome');
    const heightMapTextureTool = textureTool.createImageTexture('assets/images/heightMap.jpg', 'HeightMap');

    const material = new ShaderMaterial( {
      vertexShader,
      fragmentShader,
      uniforms: {
        uColor: {
          type: 'v3',
          value: new Vector3( 1.0, 1.0, 1.0 )
        },
        uLight: {
          type: 'v3',
          value: props.lightPosition,
        },
        uTexture: biomeTextureTool.uniform,
        uHeightMap: heightMapTextureTool.uniform,
      },
      transparent: true
    } )

    super( geometry, material )

    this.savedQuaternions = new Quaternion();
    this.baseMousePos = new Vector3();
    this.currentMousePos = new Vector3();
    this.targetedMousePos = new Vector3();
  }

  update( ) {
    // update light position
    this.material.uniforms.uLight.value = props.lightPosition;

    // updateRotation
    const dist = this.targetedMousePos.clone().sub(this.currentMousePos);
    const vel = dist.clone().multiplyScalar(props.rotationVel);
    this.currentMousePos.add(vel);

    const delta = this.currentMousePos.clone().sub(this.baseMousePos)
    const deltaRotationQuaternion = new Quaternion()
    .setFromEuler(new Euler(
       toRadians(-delta.y * props.rotationForce),
       toRadians(delta.x * props.rotationForce),
       0,
       'XYZ'
    ));
    this.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.savedQuaternions);
  }

  startDragging(mousePos) {
    this.baseMousePos.copy(mousePos);
    this.currentMousePos.copy(mousePos);
    this.targetedMousePos.copy(mousePos);
    this.savedQuaternions.copy(this.quaternion);
  }

  updateDragging(targetedMousePos) {
    this.targetedMousePos.copy(targetedMousePos);
  }
}
