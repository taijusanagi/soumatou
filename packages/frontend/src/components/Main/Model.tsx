import { Box } from "@chakra-ui/react";
import React from "react";
import * as THREE from "three";

export interface ModelProps {
  image: string;
  setScene?: (scene: THREE.Scene) => void;
}

export const Model: React.FC<ModelProps> = ({ image, setScene }) => {
  const size = 300;
  const scene = React.useMemo(() => {
    return new THREE.Scene();
  }, []);

  React.useEffect(() => {
    if (!setScene) {
      return;
    }
    setScene(scene);
  }, [scene]);

  React.useEffect(() => {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
      return;
    }

    const sizes = {
      width: size,
      height: size,
    };
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas || undefined,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const boxGeometry = new THREE.BoxGeometry(4.25, 4.25, 0.1);
    const boxTexture = new THREE.TextureLoader().load(image);
    const boxMaterial = new THREE.MeshBasicMaterial({
      map: boxTexture,
    });

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.z = -5;
    box.rotation.set(10, 10, 10);
    scene.add(box);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    pointLight.position.set(1, 2, 3);
    scene.add(pointLight);

    // TODO: have exported
    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      box.rotation.x = elapsedTime;
      box.rotation.y = elapsedTime;
      window.requestAnimationFrame(tick);
      renderer.render(scene, camera);
    };
    tick();
  }, [image, scene]);

  return (
    <Box>
      <canvas id="canvas" />
    </Box>
  );
};
