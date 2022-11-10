import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

import AggregatorArtifact from "../../../../contracts/artifacts/contracts/Aggregator.sol/Aggregator.json";
import SoumatouArtifact from "../../../../contracts/artifacts/contracts/Soumatou.sol/Soumatou.json";
import networks from "../../../../contracts/networks.json";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const network = "klaytn";

  const provider = new ethers.providers.JsonRpcProvider(networks[network].rpc);
  const soumatouContract = new ethers.Contract(
    networks[network].contracts.soumatou,
    SoumatouArtifact.abi,
    provider
  );

  const aggContract = new ethers.Contract(
    networks[network].contracts.aggregator,
    AggregatorArtifact.abi,
    provider
  );

  const totalSupply = await soumatouContract.totalSupply();

  const calls: any[] = [];
  for (let i = 0; i < totalSupply; i++) {
    calls.push(aggContract.get(i));
  }
  const rawOutput = await Promise.all(calls);
  const output = rawOutput.map((v) => {
    const lat = v.location.lat / 10 ** v.location.latDecimalLength;
    const lng = v.location.lng / 10 ** v.location.lngDecimalLength;
    return {
      tokenId: v.tokenId,
      holder: v.holder,
      location: {
        lat,
        lng,
      },
      imageURI: v.imageURI,
      modelURI: v.modelURI,
      tokenURI: v.tokenURI,
    };
  });
  console.log(output);
  res.status(200).json(output);
};

export default handler;
