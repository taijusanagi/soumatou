import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "./tasks/deploy";
import "./tasks/verify";

import { HardhatUserConfig } from "hardhat/config";

import { accounts } from "./lib/env";
import networks from "./networks.json";

const config: HardhatUserConfig = {
  solidity: "0.8.15",
  networks: {
    klaytn: {
      chainId: networks.klaytn.chainId,
      url: networks.klaytn.rpc,
      accounts,
    },
  },
  etherscan: {
    apiKey: {},
  },
};

export default config;
