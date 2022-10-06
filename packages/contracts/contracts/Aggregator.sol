// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Soumatou.sol";

contract Aggregator {
  Soumatou public soumatou;

  struct Data {
    uint256 tokenId;
    address holder;
    Soumatou.Location location;
    string imageURI;
    string modelURI;
    string tokenURI;
  }

  constructor(Soumatou soumatou_){
    soumatou = soumatou_;
  }

  /*
   * @dev this is useful for multicall in lambda
   */
  function get(uint256 tokenId) public view returns (Data memory) {
    address holder = soumatou.ownerOf(tokenId);
    (uint256 lat, uint256 latDecimalLength, uint256 lng, uint256 lngDecimalLength ) = soumatou.location(tokenId);
    Soumatou.Location memory location = Soumatou.Location(lat, latDecimalLength, lng, lngDecimalLength);
    string memory imageURI = soumatou.imageURI(tokenId);
    string memory modelURI = soumatou.modelURI(tokenId);
    string memory tokenURI = soumatou.tokenURI(tokenId);
    return Data(tokenId, holder, location, imageURI, modelURI, tokenURI);
  }
}
