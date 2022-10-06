import { BoxProps, Flex, Icon } from "@chakra-ui/react";
import React from "react";
import { GiNotebook } from "react-icons/gi";

export const ModeChangeIcon: React.FC<BoxProps> = ({ ...props }) => {
  return (
    <Flex
      border="2px"
      borderColor="gray.600"
      rounded="full"
      cursor="pointer"
      justify={"center"}
      align="center"
      shadow="md"
      backgroundColor={"white"}
      {...props}
    >
      <Icon as={GiNotebook} color="gray.600" w="60%" h="60%" />
    </Flex>
  );
};
