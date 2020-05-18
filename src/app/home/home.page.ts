import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Spaceship } from '../_classes/spaceship';
import { ModelMapper } from 'model-mapper';
import { Observable, of } from 'rxjs';
import { Point } from '../_classes/point';
// import { animate } from '@angular/animations';
import { Luminary } from '../_classes/luminary';
import { HttpClient } from '@angular/common/http';
import { Star } from '../_classes/star';
import { Planet } from '../_classes/planet';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { filter } from 'rxjs/operators';
// import * as OrbitControlsHelper from 'three-orbit-controls';
// const OrbitControls = OrbitControlsHelper(THREE);

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

  @ViewChild('container', { static: true })
  public container: ElementRef;
  public selected: Luminary;

  public sceneDebugControl: FormControl;
  public sceneSpeedControl: FormControl;
  public luminaryNameControl: FormControl;
  public luminarySizeControl: FormControl;

  public spaceship: Spaceship;
  public moves = [];
  public destination: Point;

  private spaceshipMovingInterval: any;
  private width: number;
  private height: number;
  private helpers: any[] = [];
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private controls: OrbitControls;
  private luminaries: Luminary[] = [];
  private hover: Luminary;

  constructor(private formBuilder: FormBuilder) { }

  async ngOnInit() {
    this.width = this.container.nativeElement.clientWidth;
    this.height = this.container.nativeElement.clientHeight;
    this.initFormControls();
    this.initScene();
    this.animateScene();
    this.container.nativeElement.addEventListener('mousemove', $event => this.onMouseMove($event), false);
    this.container.nativeElement.addEventListener('click', $event => this.onClick($event), false);
  }


  // animate() {

  //   requestAnimationFrame(() => this.animate());

  //   this.mesh.rotation.x += 0.01;
  //   this.mesh.rotation.y += 0.02;

  //   this.renderer.render(this.scene, this.camera);

  // }



  /*
    Three.js "tutorials by example"
    Author: Lee Stemkoski
    Date: June 2013 (three.js v56)
   */

  // MAIN

  // // standard global variables
  // var container, scene, camera, renderer, controls, stats;
  // var keyboard = new THREEx.KeyboardState();
  // var clock = new THREE.Clock();
  // // custom global variables
  // var cube;

  // init();
  // animate();

  private initFormControls() {
    this.sceneDebugControl = new FormControl(false, [Validators.required]);
    this.sceneDebugControl.valueChanges
      .subscribe(val => this.helpers.forEach(h => h.visible = val));
    this.sceneSpeedControl = new FormControl(1, [Validators.required]);
    this.luminaryNameControl = new FormControl('', [Validators.required]);
    this.luminaryNameControl.valueChanges
      .pipe(filter(() => !!this.selected))
      .subscribe(v => this.selected.setName(v));
    this.luminarySizeControl = new FormControl('', [Validators.required]);
    this.luminarySizeControl.valueChanges
      .pipe(filter(() => !!this.selected))
      .subscribe(v => this.selected.setSize(v));
  }

  private setSelected(luminary: Luminary) {
    this.luminaryNameControl.setValue(luminary ? luminary.name : null, { emitEvent: false });
    this.luminarySizeControl.setValue(luminary ? luminary.size : null, { emitEvent: false });
  }

  private initScene() {

    // SCENE
    this.scene = new THREE.Scene();
    const sceneTexture = new THREE.TextureLoader().load(`assets/images/space.jpg`);
    // this.scene.background = sceneTexture;
    // this.scene.fog = new THREE.Fog(0xFFFFFF, Math.min(this.height, this.width) / 2 - 32);

    // CAMERA
    const VIEW_ANGLE = 45;
    const ASPECT = this.width / this.height;
    const NEAR = 0.01;
    const FAR = 2000;
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);
    this.camera.position.set(0, 100, 400);
    this.camera.lookAt(this.scene.position);

    // RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const container = document.createElement('div');
    this.container.nativeElement.appendChild(container);
    container.appendChild(this.renderer.domElement);

    // RAYCASTER
    this.raycaster = new THREE.Raycaster();

    // MOUSE
    this.mouse = new THREE.Vector2();

    // LIGHT
    this.scene.add(new THREE.AmbientLight(0x444444));
    const light = new THREE.PointLight(0xffffff, 1);
    light.castShadow = true;
    light.position.set(0, 0, 0);
    light.shadow.mapSize.width = 2048;  // default
    light.shadow.mapSize.height = 2048; // default
    light.shadow.camera.near = 0.1;       // default
    light.shadow.camera.far = 2000;      // default
    this.scene.add(light);

    // CONTROLS
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 2000;
    this.controls.target.set(0, 2, 0);
    this.controls.update();

    // HELPERS
    const axesHelper = new THREE.AxesHelper(2000);
    axesHelper.visible = false;
    this.helpers.push(axesHelper);
    this.scene.add(axesHelper);
    const pointLightHelper = new THREE.PointLightHelper(light, 12);
    pointLightHelper.visible = false;
    this.helpers.push(pointLightHelper);
    this.scene.add(pointLightHelper);

    // Luminaries

    const star = new ModelMapper(Star).map({
      name: 'sun',
      size: 8,
      position: { x: 0, y: 0, z: 0 },
      spin: {}
    });
    star.init(this.scene, this.camera);
    this.luminaries.push(star);

    const planet1 = new ModelMapper(Planet).map({
      name: 'planet-1',
      source: 'planet1', glowColor: '#0192c9', size: 4,
      orbit: { xRadius: 200, yRadius: 150 },
      spin: {}
    });
    planet1.init(this.scene, this.camera, star);
    this.luminaries.push(planet1);

    const moon1 = new ModelMapper(Planet).map({
      name: 'moon-1',
      source: 'planet2',
      size: 0.5,
      orbit: { xRadius: 20, yRadius: 15, speed: -0.05, opacity: 0.05 },
      spin: {}
    });
    moon1.init(this.scene, this.camera, planet1);
    this.luminaries.push(moon1);

    const planet2 = new ModelMapper(Planet).map({
      name: 'planet-2',
      source: 'planet6', glowColor: '#5ebbdc', size: 5,
      orbit: { xRadius: 400, yRadius: 300, speed: 0.005 },
      spin: {}
    });
    planet2.init(this.scene, this.camera, star);
    this.luminaries.push(planet2);

    const moon2 = new ModelMapper(Planet).map({
      name: 'moon-2',
      source: 'planet4',
      size: 0.5,
      orbit: { xRadius: 28, yRadius: 21, speed: -0.05, opacity: 0.05 },
      spin: {}
    });
    moon2.init(this.scene, this.camera, planet2);
    this.luminaries.push(moon2);

    const planet3 = new ModelMapper(Planet).map({
      name: 'planet-3',
      source: 'planet7', glowColor: '#b87540', size: 3,
      orbit: { xRadius: 100, yRadius: 75, speed: 0.05 },
      spin: { xSpeed: 0, ySpeed: 0.02 }
    });
    planet3.init(this.scene, this.camera, star);
    this.luminaries.push(planet3);
  }

  private animateScene() {
    requestAnimationFrame(() => this.animateScene());
    this.controls.update();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    let hover = null;
    for (const l of this.luminaries) {
      l.tick(this.scene, this.camera, this.sceneSpeedControl ? this.sceneSpeedControl.value : 1);
      if (l.hover(this.raycaster, this.mouse)) { hover = l; }
    }
    this.setHover(hover);
    this.render();
  }

  private setHover(hover: Luminary) {
    this.hover = hover;
    this.container.nativeElement.style.cursor = this.hover ? 'pointer' : 'default';
  }

  private render() {
    this.renderer.autoClear = false; // don't remove previous layer results
    this.camera.layers.set(0);
    this.renderer.render(this.scene, this.camera);
    this.renderer.autoClear = false; // don't remove previous layer results
    this.camera.layers.set(1); // point light layer
    this.renderer.render(this.scene, this.camera);
  }

  private onMouseMove($event) {
    if (this.mouse) {
      this.mouse.x = ($event.clientX / this.width) * 2 - 1;
      this.mouse.y = - ($event.clientY / this.height) * 2 + 1;
    }
  }

  private onClick($event) {
    this.setSelected(this.selected = this.hover);
  }

  // private setHover(intersection: THREE.Intersection) {
  //   if (intersection.object instanceof THREE.Mesh) {

  //   } else if (intersection.object instanceof THREE.Line) {
  //     const material: THREE.LineBasicMaterial = Array.isArray((intersection.object as THREE.Line).material) ?
  //       (intersection.object as THREE.Line).material[0] : (intersection.object as THREE.Line).material;
  //     material.color.set('red');
  //   }
  // }

  // async ngOnInit() {
  // this.ctx = this.canvasRef.nativeElement.getContext('2d');
  // this.width = this.container.nativeElement.clientWidth;
  // this.height = this.container.nativeElement.clientHeight;
  // this.center = new Point(this.width / 2, this.height / 2);
  // this.canvasRef.nativeElement.height = this.height;
  // this.canvasRef.nativeElement.width = this.width;

  // const star = new ModelMapper(Luminary).map({
  //   name: 'ST-01', source: 'sun-1.bump.jpg', size: 80,
  //   position: this.center.toJson(),
  //   spin: { speed: 30000, tilt: -15, dir: -1 },
  //   children: [
  //     {
  //       name: 'ST-PM-01', source: 'planet-3.bump.jpg', size: 40,
  //       rotation: { orbit: { a: 500, b: 250 }, speed: 300000 },
  //       spin: { speed: 30000 },
  //       children: [
  //         {
  //           name: 'ST-PM-MN-01', source: 'planet-2.bump.jpg', size: 10,
  //           rotation: { orbit: { a: 30, b: 30 }, speed: 20000, dir: 1 },
  //           spin: { speed: 10000, dir: -1 },
  //         }
  //       ]
  //     }, {
  //       name: 'ST-PM-02', source: 'planet-2.bump.jpg', size: 50,
  //       rotation: { orbit: { a: 700, b: 350 }, speed: 500000 },
  //       spin: { speed: 50000 }
  //     }, {
  //       name: 'ST-PM-03', source: 'planet-4.bump.jpg', size: 40,
  //       rotation: { orbit: { a: 300, b: 150 }, speed: 500000 },
  //       spin: { speed: 50000 }
  //     }
  //   ]
  // });
  // await star.init();
  // console.log(star);
  // this.elements.push(star);
  // this.animate();

  // this.spaceship = new ModelMapper(Spaceship).map({
  //   name: 'Space Ship 1',
  //   position: { x: 200, y: 200 }
  // });
  // this.spaceship.update();


  // let lastX;
  // let lastY;
  // let scaleFactor;

  // this.canvasRef.nativeElement.addEventListener('click', ($event) => {
  //   if (this.hover === this.selected) { return; }
  //   if (this.selected) {
  //     this.selected.toggleSelect(false);
  //     this.selected = null;
  //   }
  //   if (this.hover) {
  //     this.selected = this.hover;
  //     this.selected.toggleSelect(true);
  //   }
  // });

  // this.canvasRef.nativeElement.addEventListener('mousemove', ($event) => {
  //   $event.preventDefault();
  //   $event.stopPropagation();
  //   const mx = $event.offsetX || ($event.pageX - this.canvasRef.nativeElement.offsetLeft);
  //   const my = $event.offsetY || ($event.pageY - this.canvasRef.nativeElement.offsetTop);
  //   const f = (e, x, y) => {
  //     if (e.contains(x, y)) {
  //       this.hover = e;
  //       this.canvasRef.nativeElement.style.cursor = 'pointer';
  //     }
  //     e.children.forEach(c => f(c, x, y));
  //   };
  //   this.hover = null;
  //   this.canvasRef.nativeElement.style.cursor = 'default';
  //   this.elements.forEach(e => f(e, mx, my));
  //   // if (this.ctx.isPointInPath(x, y)) {
  //   //   alert('The mouse is inside this shape');
  //   // }
  // }, false);

  // const handleScroll =  (evt) => {
  //   const delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
  //   if (delta) {
  //     var pt = this.ctx.transformedPoint(lastX, lastY);
  //     this.ctx.translate(pt.x, pt.y);
  //     const factor = Math.pow(scaleFactor, delta);
  //     this.ctx.scale(factor, factor);
  //     this.ctx.translate(-pt.x, -pt.y);
  //     // redraw();
  //   }
  //   return evt.preventDefault() && false;
  // };

  // this.canvasRef.nativeElement.addEventListener('DOMMouseScroll', handleScroll, false);
  // this.canvasRef.nativeElement.addEventListener('mousewheel', handleScroll, false);
  // }

  // private selected: Luminary;
  // private hover: Luminary;

  // private animate() {
  //   this.ctx.clearRect(0, 0, this.width, this.height);
  //   this.draw();
  //   window.requestAnimationFrame(() => this.animate());
  // }

  // private draw() {
  //   this.elements.forEach(e => e.draw(this.ctx));
  // }

  // public goTo($event) {
  // const sp = this.moves.splice(0, this.moves.length);
  // this.destination = new Point($event.clientX, $event.clientY);
  // let move = {
  //   position: sp[0] ? sp[0].position : this.spaceship.position,
  //   rotation: sp[0] ? sp[0].rotation : this.spaceship.rotation,
  //   vector: sp[0] ? sp[0].vector : this.spaceship.vector
  // };
  // const distance = Math.hypot(this.destination.x - move.position.x, this.destination.y - move.position.y);
  // console.log('distance', distance);
  // let count = 1000;
  // while (--count) {
  //   const dvector = Vector2D.from(move.position, this.destination);
  //   const angle = Vector2D.angle(move.vector, dvector).setPrecision(2);
  //   const rotationSpeed = Angle.fromDegree(this.spaceship.speed * 2);
  //   const rotateBy = Math.min(rotationSpeed.radian, Math.abs(angle.radian)) * (angle.isAssisted ? 1 : -1);
  //   const rotation = move.rotation.clone().add(rotateBy);
  //   const speed = rotateBy ?
  //     (distance < 50 ? this.spaceship.speed / 3 : distance < 100 ? this.spaceship.speed / 2 : this.spaceship.speed) :
  //     this.spaceship.speed;
  //   const vector = new Vector2D(Math.cos(rotation.radian) * speed, Math.sin(rotation.radian) * speed);
  //   this.moves.push(move = { position: move.position.clone().move(vector), rotation, vector });
  //   if (this.destination.equals(move.position, speed)) { break; }
  // }
  // }

}
