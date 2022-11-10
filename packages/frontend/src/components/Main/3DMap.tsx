import { Box } from "@chakra-ui/react";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { ethers } from "ethers";
import React from "react";
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface MapProps {
  onClickToken: (tokenId: string) => void;
  lat: number;
  lng: number;
  tokens: {
    tokenId: string;
    holder: string;
    location: {
      lat: number;
      lng: number;
    };
    modelURI: string;
    tokenURI: string;
  }[];
}

export const InternalMap: React.FC<MapProps> = ({
  onClickToken,
  lat,
  lng,
  tokens,
}) => {
  const [map, setMap] = React.useState<google.maps.Map>();

  React.useEffect(() => {
    console.log("initMap");

    const mapOptions = {
      tilt: 0,
      heading: 0,
      zoom: 18,
      center: {
        lat,
        lng,
      },
      mapId: "f505bd029047b70",
      disableDefaultUI: true,
      gestureHandling: "none",
      keyboardShortcuts: false,
    };

    const mapDiv = document.getElementById("map") as HTMLElement;
    const map = new google.maps.Map(mapDiv, mapOptions);
    setMap(map);

    const webglOverlayView = new google.maps.WebGLOverlayView();
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const loader = new GLTFLoader();

    webglOverlayView.onAdd = () => {
      const ambientLight = new AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);
      const directionalLight = new DirectionalLight(0xffffff, 0.25);
      directionalLight.position.set(0.5, -1, 0.5);
      scene.add(directionalLight);
      const source =
        "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";
      loader.load(source, (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.rotation.x = Math.PI;
        scene.add(gltf.scene);
      });
    };

    webglOverlayView.onContextRestored = ({ gl }) => {
      console.log("onContextRestored", map);
      const renderer = new WebGLRenderer({
        canvas: gl.canvas,
        context: gl,
        ...gl.getContextAttributes(),
      });

      renderer.autoClear = false;

      loader.manager.onLoad = () => {
        renderer.setAnimationLoop(() => {
          webglOverlayView.requestRedraw();
          const { tilt, heading, zoom } = mapOptions;
          map.moveCamera({ tilt, heading, zoom });
          if (mapOptions.tilt < 67.5) {
            mapOptions.tilt += 0.5;
          } else if (mapOptions.heading <= 360) {
            mapOptions.heading += 0.2;
            mapOptions.zoom -= 0.0005;
          } else {
            renderer.setAnimationLoop(null);
          }
        });
      };
    };

    webglOverlayView.onDraw = ({ gl, transformer }): void => {
      console.log("onDraw", map);
      const latLngAltitudeLiteral: google.maps.LatLngAltitudeLiteral = {
        lat: mapOptions.center.lat,
        lng: mapOptions.center.lng,
        altitude: 100,
      };
      const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
      camera.projectionMatrix = new Matrix4().fromArray(matrix);

      webglOverlayView.requestRedraw();
    };
    webglOverlayView.setMap(map);

    return () => {
      webglOverlayView.unbindAll();
    };
  }, []);

  React.useEffect(() => {
    if (!map || tokens.length === 0) {
      return;
    }
    for (const token of tokens) {
      const marker = new google.maps.Marker({
        position: { lat: token.location.lat, lng: token.location.lng },
        icon: "/img/brands/pin.png",
        map,
      });
      marker.addListener("click", () => {
        const tokenId = ethers.BigNumber.from(token.tokenId).toString();
        onClickToken(tokenId);
      });
    }
  }, [map, tokens]);

  return <Box id={"map"} w="100wh" h="100vh" />;
};

export const ThreeMap: React.FC<MapProps> = ({
  onClickToken,
  lat,
  lng,
  tokens,
}) => {
  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <>loading</>;
      case Status.FAILURE:
        return <>failure</>;
      case Status.SUCCESS:
        return (
          <InternalMap
            onClickToken={onClickToken}
            tokens={tokens}
            lat={lat}
            lng={lng}
          />
        );
    }
  };

  return (
    <Wrapper
      apiKey={"AIzaSyAjoE50sTKo2lQv1UeWWHGJueWP70sXBhU"}
      render={render}
    />
  );
};
