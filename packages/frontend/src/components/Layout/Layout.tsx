import {
  Box,
  Button,
  Center,
  Fade,
  Flex,
  Image,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { useRecoilState } from "recoil";

import config from "../../../config.json";
import { sleep } from "../../lib/utils/sleep";
import { currentLocationState } from "../../store/viewer";
// import { Footer } from "../Footer";
import { Header } from "../Header";
// import { Logger } from "../Logger";
import { Model } from "../Main/Model";

export type PageMode = "lp" | "app";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [mode, setMode] = React.useState<"intro" | "app">("intro");
  const [animeMode, setAnimeMode] = React.useState<"play" | "done">("play");

  const position = config.app.layout === "dynamic" ? "absolute" : undefined;
  const headerTop = config.app.layout === "dynamic" ? "0" : undefined;
  const footerBottom = config.app.layout === "dynamic" ? "0" : undefined;

  // const [appMode, setAppMode] = React.useState<PageMode>("lp");

  const [, setCurrentLocation] = useRecoilState(currentLocationState);

  const clickStart = () => {
    setMode("app");
  };

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition((geo) => {
      console.log("set", geo.coords.latitude, geo.coords.longitude);
      setCurrentLocation({
        lat: geo.coords.latitude,
        lng: geo.coords.longitude,
      });
    });
  }, [setCurrentLocation]);

  React.useEffect(() => {
    sleep(2000).then(() => {
      onClose();
      sleep(500).then(() => {
        setAnimeMode("done");
      });
    });
  }, [onClose]);

  return (
    <Box position="relative" bgImage={"/img/brands/bg.png"}>
      <Flex minHeight={"100vh"} direction={"column"}>
        {mode === "intro" && (
          <>
            {animeMode === "play" && (
              <Fade in={isOpen}>
                <Center minHeight={"100vh"}>
                  <Image
                    src="/img/brands/anime.gif"
                    objectFit={"contain"}
                    maxW="50%"
                    alt="anime"
                  />
                </Center>
              </Fade>
            )}
            {animeMode === "done" && (
              <Center minHeight={"100vh"}>
                <Stack spacing="16">
                  <Model image="/img/brands/key.png" />
                  <Stack spacing="4">
                    <Text fontSize="xl" fontWeight={"bold"} color="yellow.800">
                      Curve the Moment into Metaverse
                    </Text>
                    <Button onClick={clickStart} colorScheme="yellow" size="lg">
                      Start
                    </Button>
                  </Stack>
                </Stack>
              </Center>
            )}
          </>
        )}
        {mode === "app" && (
          <Center height="100vh">
            <Header position={position} top={headerTop} />
            {children}
            {/* <Logger position={position} /> */}
            {/* <Footer position={position} bottom={footerBottom} /> */}
          </Center>
        )}
      </Flex>
    </Box>
  );
};
