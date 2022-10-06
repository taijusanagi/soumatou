import { isNetwork } from "../../../../contracts/types/network";

const getEnv = () => {
  const network = "klaytn";
  if (!isNetwork(network)) {
    throw new Error("env network invalid");
  }
  return { network };
};

const { network } = getEnv();
export { network };
