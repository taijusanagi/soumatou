import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Link,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { ethers } from "ethers";
import React from "react";
import { useRecoilValue } from "recoil";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { useNetwork, useSigner } from "wagmi";

import SoumatouArtifact from "../../../../contracts/artifacts/contracts/Soumatou.sol/Soumatou.json";
import networks from "../../../../contracts/networks.json";
import config from "../../../config.json";
import { network } from "../../lib/env";
import { file, metadata } from "../../lib/ipfs";
import {
  currentLocationState,
  locationState,
  mapState,
} from "../../store/viewer";
import { ConnectWalletWrapper } from "../ConnectWalletWrapper";
import { Modal } from "../Modal";
import { ThreeMap } from "./3DMap";
import { Map } from "./Map";
import { ModeChangeIcon } from "./ModeChangeIcon";
import { Model } from "./Model";

export type ModalMode = "input" | "modelPreview" | "completed";

const countDecimals = function (value: number) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
};

export const Main: React.FC = () => {
  const mapMode = useRecoilValue(mapState);
  const threeLocation = useRecoilValue(locationState);

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [modalMode, setModalMode] = React.useState<ModalMode>("input");

  const [nftMinted, setNFTMinted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [text, setText] = React.useState("");
  const [image, setImage] = React.useState("");

  const currentLocation = useRecoilValue(currentLocationState);

  const [tokenId, setTokenId] = React.useState("");

  const [scene, setScene] = React.useState<THREE.Scene>();

  const [tokens, setTokens] = React.useState([]);

  const { data: signer } = useSigner();

  const { chain } = useNetwork();

  const [isProcessing, setIsProcessing] = React.useState(false);

  // const { initMap } = use3dMap();

  const clear = () => {
    setIsLoading(false);
    setNFTMinted(false);
    setImage("");
    setModalMode("input");
    onClose();
  };

  const mainModeChange = async () => {
    setIsProcessing(true);
    if (!currentLocation.lat || !currentLocation.lng) {
      alert("please enable location. this app requires your location.");
      return;
    }
    onOpen();
  };

  const createSoumatou = async () => {
    setIsLoading(true);
    const { data } = await axios.post(
      `${window.location.origin}/api/generate`,
      {
        text,
      }
    );
    setImage(data.image);
    setModalMode("modelPreview");
    setIsLoading(false);
  };

  const retake = () => {
    clear();
    // setMainMode("map");
  };

  const modelToNFT = async () => {
    if (
      !chain ||
      !signer ||
      !network ||
      !currentLocation.lat ||
      !currentLocation.lng ||
      !scene
    ) {
      return;
    }
    if (Number(chain.network) !== networks[network].chainId) {
      alert(`please connect ${networks[network].name.toLowerCase()} network`);
      return;
    }
    setIsLoading(true);

    const model: string = await new Promise((resolve) => {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (gltfJson) => {
          console.log("model set");
          const jsonString = JSON.stringify(gltfJson);
          resolve(jsonString);
        },
        (err) => {
          console.log("error");
          console.log(err);
        }
      );
    });
    const imageFile = await file(image, "nft.png", "image/png");
    console.log(imageFile);
    const modelFile = await file(model, "nft.gltf", "model/gltf+json");
    console.log(modelFile);
    const { uri, imageURI, modelURI } = await metadata(
      "soumatou",
      "soumatou",
      imageFile,
      modelFile,
      currentLocation.lat,
      currentLocation.lng,
      text
    );

    console.log(uri);

    const address = await signer.getAddress();
    const to = address;

    const contract = new ethers.Contract(
      networks[network].contracts.soumatou,
      SoumatouArtifact.abi,
      signer
    );

    const lat = currentLocation.lat;
    const latDecimalLength = countDecimals(lat);
    const latNum = lat * 10 ** latDecimalLength;
    const latFormatted = Math.floor(latNum).toString();
    const lng = currentLocation.lng;
    const lngDecimalLength = countDecimals(lng);
    const lngNum = lng * 10 ** lngDecimalLength;
    const lngFormatted = Math.floor(lngNum).toString();
    const location = {
      lat: latFormatted.toString(),
      latDecimalLength,
      lng: lngFormatted.toString(),
      lngDecimalLength,
    };
    // location data is managed in ipfs, so this is dummy data for demo
    const tx = await contract.mint(to, location, imageURI, modelURI, uri);
    const receipt = await tx.wait();
    console.log(receipt);
    const tokenId = receipt.events[0].args.tokenId.toString();
    console.log(tokenId);
    setTokenId(tokenId);
    setIsLoading(false);
    setModalMode("completed");
  };

  const onClickTokenOn2d = (tokenId: string) => {
    setIsProcessing(false);
    console.log("tokenId", tokenId);
    setModalMode("modelPreview");
    const token = tokens.find((token: any) => {
      return ethers.BigNumber.from(token.tokenId).toString() === tokenId;
    }) as any;
    console.log(token);
    const url = token.imageURI.replace(
      "ipfs://",
      "https://nftstorage.link/ipfs/"
    );
    console.log(url);
    setNFTMinted(true);
    setTokenId(tokenId);
    setImage(url);
    onOpen();
  };

  React.useEffect(() => {
    axios
      .get(`${window.location.origin}/api/tokens`)
      .then(({ data }) => {
        console.log(data);
        setTokens(data);
      })
      .catch((e) => {
        console.error(e.message);
      });
  }, []);

  return (
    <Box minHeight={"100vh"} w={"full"} position="relative">
      {threeLocation.lat !== 0 && threeLocation.lng !== 0 && (
        <>
          {mapMode === "2d" && (
            <Map
              onClickToken={onClickTokenOn2d}
              tokens={tokens}
              cLat={currentLocation.lat}
              cLng={currentLocation.lng}
              lat={threeLocation.lat}
              lng={threeLocation.lng}
            />
          )}
          {mapMode === "3d" && (
            <ThreeMap
              // isOn={mapMode === "3d"}
              onClickToken={onClickTokenOn2d}
              tokens={tokens}
              lat={threeLocation.lat}
              lng={threeLocation.lng}
            />
          )}
        </>
      )}
      <Box bottom="8" position="absolute" w="full">
        <Flex justify={"center"} position="relative">
          <Box>
            <ModeChangeIcon h="16" w="16" onClick={mainModeChange} />
          </Box>
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={retake} header="Create Soumatou">
        <Stack spacing="4">
          {modalMode === "input" && (
            <FormControl>
              <FormLabel>Input your memory prompt</FormLabel>
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </FormControl>
          )}

          {modalMode === "modelPreview" && (
            <Center height="400px">
              <Model image={image} setScene={setScene} />
            </Center>
          )}
          {modalMode === "completed" && (
            <Stack height={"400px"} spacing="8" px="4">
              <Text align={"center"} fontSize="xl" fontWeight={"bold"}>
                Congratulations!
              </Text>
              <Text align={"center"} fontSize="xs">
                Your graffiti is converted to NFT, you can view it in Opensea
                and use it in your favorite metaverse.
              </Text>
              <Center height="240px">
                <Model image={image} />
              </Center>
            </Stack>
          )}

          <HStack justify={"space-between"} spacing="4">
            {modalMode === "input" && (
              <Button
                w="full"
                rounded={config.styles.button.rounded}
                size={config.styles.button.size}
                fontSize={config.styles.button.fontSize}
                color={config.styles.text.color.primary}
                onClick={createSoumatou}
                isLoading={isLoading}
                shadow="md"
              >
                Generate
              </Button>
            )}
            {modalMode === "modelPreview" && isProcessing && (
              <ConnectWalletWrapper w="full">
                <Button
                  w="full"
                  rounded={config.styles.button.rounded}
                  size={config.styles.button.size}
                  fontSize={config.styles.button.fontSize}
                  color={config.styles.text.color.primary}
                  onClick={modelToNFT}
                  isLoading={isLoading}
                  shadow="md"
                >
                  Mint NFT
                </Button>
              </ConnectWalletWrapper>
            )}
            {modalMode === "completed" && (
              <Button
                as={Link}
                w="full"
                rounded={config.styles.button.rounded}
                size={config.styles.button.size}
                fontSize={config.styles.button.fontSize}
                color={config.styles.text.color.primary}
                href={`https://testnets.opensea.io/assets/baobab/${networks[network].contracts.soumatou}/${tokenId}`}
                target="_blank"
                style={{ textDecoration: "none" }}
              >
                View in Opensea
              </Button>
            )}
          </HStack>
        </Stack>
      </Modal>
    </Box>
  );
};
