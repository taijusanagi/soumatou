import fs from "fs";
import { task } from "hardhat/config";
import path from "path";

import networks from "../networks.json";
import { isNetwork } from "../types/network";

task("deploy", "deploy").setAction(async (_, { network, ethers }) => {
  const { name } = network;
  if (!isNetwork(name)) {
    console.log("network invalid");
    return;
  }
  /*
   * @dev add deployscript and update networks
   */

  const Soumatou = await ethers.getContractFactory("Soumatou");
  const soumatou = await Soumatou.deploy();
  networks[name].contracts.soumatou = soumatou.address;

  const Aggregator = await ethers.getContractFactory("Aggregator");
  const aggregator = await Aggregator.deploy(soumatou.address);
  networks[name].contracts.aggregator = aggregator.address;

  fs.writeFileSync(
    path.join(__dirname, "../networks.json"),
    JSON.stringify(networks)
  );
  console.log("DONE");
});
