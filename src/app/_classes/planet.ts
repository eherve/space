import * as THREE from 'three';
import { propertyMap } from 'model-mapper';
import { Luminary, Spin } from './luminary';

export class Orbit {

  @propertyMap()
  public xRadius: number;

  @propertyMap()
  public yRadius: number;

  @propertyMap({ default: 0xeeeeee })
  public color = 0xeeeeee;

  @propertyMap({ default: 0.2 })
  public opacity = 0.2;

  @propertyMap({ default: 0.01 })
  public speed = 0.01;

  @propertyMap({ default: 1000 })
  public nbPoints = 1000;

  @propertyMap({ default: false })
  public hidePath = false;

  public path: THREE.EllipseCurve;
  public move = 0;

}

export class Planet extends Luminary {

  static vertexShader = `
  uniform vec3 viewVector;
  uniform float c;
  uniform float p;
  varying float intensity;
  void main()
  {
    vec3 vNormal = normalize( normalMatrix * normal );
    vec3 vNormel = normalize( normalMatrix * viewVector );
    intensity = pow( c - dot(vNormal, vNormel), p );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;

  static fragmentShader = `
    uniform vec3 glowColor;
    varying float intensity;
    void main()
    {
      vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 0.4 );
    }`;

  @propertyMap()
  public source: string;

  @propertyMap()
  public glowColor: string;

  @propertyMap({ type: Orbit })
  public orbit: Orbit;

  private parent: Luminary;
  private surface: THREE.Mesh;
  private clouds: THREE.Mesh;
  private glow: THREE.Mesh;
  private ellipse: THREE.Line;

  public init(scene: THREE.Scene, camera: THREE.PerspectiveCamera, parent?: Luminary) {
    this.parent = parent;
    this.addPlanet(scene);
    if (this.glowColor) { this.addGlow(scene, camera); }
    if (this.orbit) {
      this.addOrbit(scene);
    } else {
      this.updatePosition(this.position.x, this.position.y, 0);
    }

  }

  public tick(scene: THREE.Scene, camera: THREE.PerspectiveCamera, speedFactor = 1) {
    if (this.spin) { this.tickSpin(speedFactor); }
    if (this.orbit) {
      if (this.parent) {
        this.ellipse.position.x = this.parent.position.x;
        this.ellipse.position.y = this.parent.position.y;
      }
      const speed = this.orbit.speed * speedFactor;
      this.orbit.move += (speed / this.orbit.nbPoints);
      const nextPoint = speed >= 0 ?
        (this.orbit.move > 1 ? (this.orbit.move = 0) : this.orbit.move) :
        this.orbit.move < -1 ? (this.orbit.move = 1) : 1 - this.orbit.move;
      const point = this.orbit.path.getPoint(nextPoint);
      point.setX(point.x + this.ellipse.position.x);
      point.setY(point.y + this.ellipse.position.y);
      this.updatePosition(point.x, point.y, 0);
    }
  }

  public hover(raycaster: THREE.Raycaster, mouse: THREE.Vector2): boolean {
    raycaster.layers.set(0);
    const intersects = raycaster.intersectObject(this.surface);
    return !!intersects.length;
  }

  protected updatePosition(x: number, y: number, z: number) {
    super.updatePosition(x, y, z);
    this.surface.position.set(x, y, z);
    if (this.clouds) { this.clouds.position.set(x, y, z); }
    if (this.glow) { this.glow.position.set(x, y, z); }
  }

  private tickSpin(speedFactor: number) {
    this.surface.rotation.x += this.spin.xSpeed * speedFactor;
    this.surface.rotation.y += this.spin.ySpeed * speedFactor;
    this.surface.rotation.z += this.spin.zSpeed * speedFactor;
    if (this.clouds) {
      this.clouds.rotation.x += (this.spin.xSpeed / 10) * speedFactor;
      this.clouds.rotation.y += (this.spin.ySpeed / 10) * speedFactor;
      this.clouds.rotation.z += (this.spin.zSpeed / 10) * speedFactor;
    }
  }

  private addPlanet(scene: THREE.Scene) {
    const materialData: any = { map: new THREE.TextureLoader().load(`assets/images/planets/${this.source}/surface.jpg`) };

    materialData.bumpMap = new THREE.TextureLoader().load(`assets/images/planets/${this.source}/bump.jpg`,
      undefined,
      undefined,
      err => console.warn(`planet ${this.source} has no bump file`));
    materialData.bumpScale = 0.005;

    materialData.specularMap = new THREE.TextureLoader().load(`assets/images/planets/${this.source}/specular.png`,
      undefined,
      undefined,
      err => console.warn(`planet ${this.source} has no specular file`));
    materialData.specular = new THREE.Color('grey');

    this.surface = new THREE.Mesh(
      // new THREE.SphereGeometry(this.size, 32, 32),
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshPhongMaterial(materialData)
    );
    this.surface.rotation.set(Math.PI / 2, 0, 0.1);
    this.surface.scale.multiplyScalar(this.size);
    this.surface.castShadow = true;
    this.surface.receiveShadow = true;
    scene.add(this.surface);

    new THREE.TextureLoader().load(`assets/images/planets/${this.source}/clouds.png`,
      texture => {
        this.clouds = new THREE.Mesh(
          new THREE.SphereGeometry(1, 32, 32),
          new THREE.MeshPhongMaterial({ map: texture, transparent: true }));
        this.clouds.scale.multiplyScalar(this.size + 0.03);
        this.clouds.castShadow = true;
        this.clouds.receiveShadow = true;
        scene.add(this.clouds);
      },
      undefined,
      err => console.warn(`planet ${this.source} has no clouds file`));
  }

  private addGlow(scene: THREE.Scene, camera: THREE.Camera) {
    const customMaterial = new THREE.ShaderMaterial(
      {
        uniforms:
        {
          c: { type: 'f', value: 1 },
          p: { type: 'f', value: 2 },
          glowColor: { type: 'c', value: new THREE.Color(this.glowColor) },
          viewVector: { type: 'v3', value: camera.position }
        },
        vertexShader: Planet.vertexShader,
        fragmentShader: Planet.fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
    this.glow = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), customMaterial);
    this.glow.scale.multiplyScalar(this.size + 0.1);
    scene.add(this.glow);
  }

  private addOrbit(scene: THREE.Scene) {
    const x = this.parent ? this.parent.position.x : this.position.x;
    const y = this.parent ? this.parent.position.y : this.position.y;
    this.orbit.path = new THREE.EllipseCurve(0, 0, this.orbit.xRadius, this.orbit.yRadius, 0, Math.PI * 2, false, 0);
    const geometry = new THREE.BufferGeometry().setFromPoints(this.orbit.path.getPoints(this.orbit.nbPoints));
    const material = new THREE.LineBasicMaterial({
      color: this.orbit.color, linewidth: 0.1, transparent: true, opacity: this.orbit.opacity
    });
    this.ellipse = new THREE.Line(geometry, material);
    this.ellipse.position.x = x;
    this.ellipse.position.y = y;
    if (!this.orbit.hidePath) { scene.add(this.ellipse); }
    const point = this.orbit.path.getPoint(this.orbit.move = Math.random());
    point.setX(point.x + this.ellipse.position.x);
    point.setY(point.y + this.ellipse.position.y);
    this.updatePosition(point.x, point.y, 0);
  }

  protected sizeUpdated() {
    this.surface.scale.setScalar(this.size);
    if (this.clouds) { this.clouds.scale.setScalar(this.size + 0.03); }
    if (this.glow) { this.glow.scale.setScalar(this.size + 0.1); }
  }

}
