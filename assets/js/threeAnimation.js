
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import lottie from 'https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/+esm';

(function () {
    "use strict";
    console.log("Three.js + Lottie Animation Initializing...");

    function initThreeJS() {
        const container = document.getElementById('three-canvas-container');
        if (!container) return;

        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.z = 3;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            const environment = new RoomEnvironment();
            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            scene.environment = pmremGenerator.fromScene(environment).texture;

            // Load Lottie animation from file
            fetch('assets/textures/lottie/24017-lottie-logo-animation.json')
                .then(response => response.json())
                .then(lottieData => {
                    // Lottie Canvas Setup
                    const lottieContainer = document.createElement('div');
                    const dpr = window.devicePixelRatio;
                    lottieContainer.style.width = lottieData.w * dpr + 'px';
                    lottieContainer.style.height = lottieData.h * dpr + 'px';
                    lottieContainer.style.display = 'none';
                    document.body.appendChild(lottieContainer);

                    const animation = lottie.loadAnimation({
                        container: lottieContainer,
                        animType: 'canvas',
                        loop: true,
                        autoplay: true,
                        animationData: lottieData,
                        rendererSettings: { dpr: dpr }
                    });

                    const texture = new THREE.CanvasTexture(animation.container);
                    texture.minFilter = THREE.NearestFilter;
                    texture.generateMipmaps = false;
                    texture.colorSpace = THREE.SRGBColorSpace;

                    animation.addEventListener('enterFrame', () => { texture.needsUpdate = true; });

                    // Geometry
                    const geometry = new RoundedBoxGeometry(1.2, 1.2, 1.2, 8, 0.15);
                    const material = new THREE.MeshStandardMaterial({ roughness: 0.1, map: texture });
                    const mesh = new THREE.Mesh(geometry, material);
                    scene.add(mesh);

                    function animate() {
                        requestAnimationFrame(animate);
                        mesh.rotation.y += 0.01;
                        mesh.rotation.x += 0.005;
                        renderer.render(scene, camera);
                    }
                    animate();

                    console.log("Three.js + Lottie Ready with 24017-lottie-logo-animation.json");

                    // GSAP Scroll Animation
                    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                        const triggerSection = document.querySelector(".section-about-me");
                        if (triggerSection) {
                            const tl = gsap.timeline({
                                scrollTrigger: {
                                    trigger: triggerSection,
                                    start: "top center",
                                    end: "bottom center",
                                    scrub: 1.5,
                                    invalidateOnRefresh: true
                                }
                            });

                            tl.to(mesh.scale, { x: 40, y: 40, z: 40, ease: "power2.in" });
                            tl.to(camera.position, { z: 0.1, ease: "power2.in" }, 0);
                            tl.to(container, { filter: "blur(20px)", opacity: 0, duration: 0.2 }, "-=0.2");
                        }
                    }

                    window.addEventListener('resize', () => {
                        camera.aspect = container.clientWidth / container.clientHeight;
                        camera.updateProjectionMatrix();
                        renderer.setSize(container.clientWidth, container.clientHeight);
                    });
                })
                .catch(error => {
                    console.error("Error loading Lottie animation:", error);
                });

        } catch (error) {
            console.error("Three.js Init Error:", error);
        }
    }

    if (document.readyState === 'complete') initThreeJS();
    else window.addEventListener('load', initThreeJS);

})();
