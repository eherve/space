import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';
import { propertyMap } from 'model-mapper';
import { Luminary } from './luminary';

interface ILensFlare extends THREE.Mesh {
  texture?: THREE.Texture;
  m?: THREE.Material;
  display?: boolean;
  time?: number;
  opacityStep?: number;
  rotationStep?: number;
}

export class Star extends Luminary {

  static starTexture = new THREE.TextureLoader().load('/assets/images/stars/surface.png');
  static starMaterial = new THREE.MeshPhongMaterial({ map: Star.starTexture });
  static cloudTexture = new THREE.TextureLoader().load('/assets/images/stars/cloud.png');
  static cloudMaterial = new THREE.MeshPhongMaterial({ map: Star.cloudTexture, transparent: true });
  // static starTexture = new THREE.TextureLoader().load('/assets/images/stars/sun-1.jpg');
  // static lensflare0Texture = new THREE.TextureLoader().load('/assets/images/stars/lensflare0.png');
  // static lensflare1Texture = new THREE.TextureLoader().load('/assets/images/stars/lensflare1.png');
  // static lensflare2Texture = new THREE.TextureLoader().load('/assets/images/stars/lensflare2.png');
  // static lensflare0Material = new THREE.MeshPhongMaterial({ map: Star.lensflare0Texture, transparent: true });
  // static planeMaterial = new THREE.MeshLambertMaterial( { map: Star.lensflare2Texture } );
  // static lensflareTexture = new THREE.TextureLoader().load('/assets/images/stars/lensflare2.png');

  static vertexShader = `
      uniform vec2 uvScale;
			varying vec2 vUv;

			void main()
			{

				vUv = uvScale * uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;

			}
  `;
  // static vertexShader = `
  //   uniform vec3 viewVector;
  //   uniform float c;
  //   uniform float p;
  //   varying float intensity;
  //   void main()
  //   {
  //     vec3 vNormal = normalize( normalMatrix * normal );
  //     vec3 vNormel = normalize( normalMatrix * viewVector );
  //     intensity = pow( c - dot(vNormal, vNormel), p );
  //     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  //   }`;

  static fragmentShader = `
      uniform float time;
			uniform vec2 resolution;

			uniform float fogDensity;
			uniform vec3 fogColor;

			uniform sampler2D texture1;
			uniform sampler2D texture2;

			varying vec2 vUv;

			void main( void ) {

				vec2 position = -1.0 + 2.0 * vUv;

				vec4 noise = texture2D( texture1, vUv );
				vec2 T1 = vUv + vec2( 1.5, -1.5 ) * time  *0.02;
				vec2 T2 = vUv + vec2( -0.5, 2.0 ) * time * 0.01;

				T1.x += noise.x * 2.0;
				T1.y += noise.y * 2.0;
				T2.x -= noise.y * 0.2;
				T2.y += noise.z * 0.2;

				float p = texture2D( texture1, T1 * 2.0 ).a;

				vec4 color = texture2D( texture2, T2 * 2.0 );
				vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

				if( temp.r > 1.0 ){ temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
				if( temp.g > 1.0 ){ temp.rb += temp.g - 1.0; }
				if( temp.b > 1.0 ){ temp.rg += temp.b - 1.0; }

				gl_FragColor = temp;

				float depth = gl_FragCoord.z / gl_FragCoord.w;
				const float LOG2 = 1.442695;
				float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
				fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

				gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

			}
  `;
  // static fragmentShader = `
  //     uniform vec3 glowColor;
  //     varying float intensity;
  //     void main()
  //     {
  //       vec3 glow = glowColor * intensity;
  //       gl_FragColor = vec4( glow, 1.0 );
  //     }`;

  // static lensflare0 = new THREE.TextureLoader().load('/assets/images/stars/lensflares/lensflare0.png');
  // static lensflare0_alpha = new THREE.TextureLoader().load('/assets/images/stars/lensflares/lensflare0.alpha.png');
  // static lensflare1 = new THREE.TextureLoader().load('/assets/images/stars/lensflares/lensflare1.png');
  // static lensflare2 = new THREE.TextureLoader().load('/assets/images/stars/lensflares/lensflare2.png');
  // static lensflare3 = new THREE.TextureLoader().load('/assets/images/stars/lensflares/lensflare3.png');
  // static lensflare_1 = new THREE.TextureLoader().load('/assets/images/stars/lensflares/lensflare-1.png');

  @propertyMap({ default: 0xffffff })
  public color = 0xffffff;

  private surface: THREE.Mesh;
  private lensflares: ILensFlare[];

  public init(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.addSurface(scene);
    const spotLight = new THREE.AmbientLight(this.color, 2);
    spotLight.layers.set(1);
    scene.add(spotLight);
    // this.addLensflares(scene, camera, spotLight);
    // this.addGlow(scene, camera);
  }

  public tick(scene: THREE.Scene, camera: THREE.PerspectiveCamera, speedFactor = 1) {
    if (this.spin) { this.tickSpin(speedFactor); }
    // this.updateLensFlares(scene, camera);
  }

  public hover(raycaster: THREE.Raycaster, mouse: THREE.Vector2): boolean {
    raycaster.layers.set(1);
    const intersects = raycaster.intersectObject(this.surface);
    return !!intersects.length;
    // console.log(this.surfaces[0], mouse);
    // return false;
    // return Math.abs(mouse.x) <= this.radius && Math.abs(mouse.y) <= this.radius;
  }

  private tickSpin(speedFactor: number) {
    this.surface.rotation.x += this.spin.xSpeed * speedFactor;
    this.surface.rotation.y += this.spin.ySpeed * speedFactor;
    this.surface.rotation.z += this.spin.zSpeed * speedFactor;
  }

  private addLensflares(scene: THREE.Scene, camera: THREE.PerspectiveCamera, light: THREE.AmbientLight) {
    this.lensflares = [];
    for (let i = 0; i < 4; ++i) {
      this.lensflares.push(this.buildLensFlare(Date.now() + (Math.random() * 1000 * i) + 1000));
    }
  }

  private buildLensFlare(now: number): ILensFlare {
    const size = Math.random() * 16;
    const planeGeometry = new THREE.PlaneGeometry(32 + size, 32 + size, 512, 512);
    const texture = new THREE.TextureLoader().load('/assets/images/stars/lensflare2.png');
    texture.center.set(.5, .5);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const plane: ILensFlare = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.layers.set(1);
    plane.receiveShadow = false;
    plane.texture = texture;
    plane.time = now;
    plane.display = false;
    plane.m = planeMaterial;
    return plane;
  }

  private addSurface(scene: THREE.Scene) {
    const starGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.surface = new THREE.Mesh(starGeometry, Star.starMaterial);
    this.surface.rotation.set(Math.PI / 2, 0, 0);
    this.surface.scale.multiplyScalar(this.size);
    this.surface.layers.set(1);
    this.surface.position.x = this.position.x;
    this.surface.position.y = this.position.y;
    this.surface.position.z = this.position.z;
    scene.add(this.surface);

    // const cloudMesh: ISurfaceMesh = new THREE.Mesh(new THREE.SphereGeometry(this.size, 32, 32), Star.cloudMaterial);
    // cloudMesh.layers.set(1);
    // cloudMesh.position.x = this.position.x;
    // cloudMesh.position.y = this.position.y;
    // cloudMesh.position.z = this.position.z;
    // cloudMesh.xStep = -0.001;
    // cloudMesh.yStep = -0.001;
    // cloudMesh.zStep = 0;
    // this.surface.push(cloudMesh);
    // scene.add(cloudMesh);

    // const starMesh: ISurfaceMesh = new THREE.Mesh(new THREE.SphereGeometry(this.size - index, 32, 32), Star.starMaterial);
    // starMesh.layers.set(1);
    // starMesh.position.x = this.position.x;
    // starMesh.position.y = this.position.y;
    // starMesh.position.z = this.position.z;
    // starMesh.xStep = 0;
    // starMesh.yStep = 0.001;
    // starMesh.zStep = 0;
    // return starMesh;
    // const uniforms = {
    //   fogDensity: { type: 'f', value: 0.17 },
    //   fogColor: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
    //   time: { type: 'f', value: 1.0 },
    //   resolution: { type: 'v2', value: new THREE.Vector2() },
    //   uvScale: { type: 'v2', value: new THREE.Vector2(3.0, 1.0) },
    //   texture1: { type: 't', value: new THREE.TextureLoader().load('/assets/images/stars/cloud.png') },
    //   texture2: { type: 't', value: new THREE.TextureLoader().load('/assets/images/stars/lavatile.jpg') }
    // };
    // uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
    // uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;
    // const material = new THREE.ShaderMaterial({
    //   uniforms, vertexShader: Star.vertexShader, fragmentShader: Star.fragmentShader
    // });
    // const starMesh: ISurfaceMesh = new THREE.Mesh(new THREE.SphereGeometry(this.size - index, 32, 32), material);
    // starMesh.layers.set(1);
    // starMesh.xStep = 0;
    // starMesh.yStep = 0.001;
    // starMesh.zStep = 0;
    // return starMesh;
  }

  private addGlow(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    const customMaterial = new THREE.ShaderMaterial(
      {
        uniforms:
        {
          c: { type: 'f', value: 1 },
          p: { type: 'f', value: 2 },
          glowColor: { type: 'c', value: new THREE.Color(0xffffff) },
          viewVector: { type: 'v3', value: camera.position }
        },
        vertexShader: Star.vertexShader,
        fragmentShader: Star.fragmentShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(this.size, 32, 32), customMaterial);
    // const glow = new THREE.Mesh(new THREE.SphereGeometry(this.size, 32, 32),
    //   new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0.5, transparent: true }));
    glow.scale.multiplyScalar(1.1);
    glow.layers.set(1);
    scene.add(glow);
  }

  private updateLensFlares(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.lensflares.forEach(lf => {
      if (!lf.display && lf.time < Date.now()) {
        scene.add(lf);
        lf.display = true;
        lf.texture.rotation = THREE.MathUtils.degToRad(Math.random() * 180);
        lf.opacityStep = 0.02;
        lf.m.opacity = 0.2;
        lf.rotationStep = 0.05 * (Math.random() > 0.5 ? 1 : -1);
        lf.scale.setScalar(0.8 + Math.random());
      }
      if (lf.display) {
        if (lf.m.opacity > 1) { lf.opacityStep = lf.opacityStep * -1; }
        lf.m.opacity += lf.opacityStep;
        lf.texture.rotation += THREE.MathUtils.degToRad(lf.rotationStep);
        if (lf.m.opacity <= 0.2) {
          scene.remove(lf);
          lf.display = false;
          lf.time = Date.now() + (Math.random() * 1000);
        }
      } else {
        return;
      }
      lf.lookAt(camera.position);
    });
  }

  protected sizeUpdated() {
    this.surface.scale.setScalar(this.size);
  }

}
