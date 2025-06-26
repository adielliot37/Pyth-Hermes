// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";


contract PythUpdater {
    IPyth public immutable pyth;

    
    constructor(address _pythCore) {
        pyth = IPyth(_pythCore);
    }

   
    function updateFeeds(bytes calldata updateData) external payable {
       
        bytes[] memory arr = new bytes[](1);

       
        arr[0] = updateData;

        
        uint256 fee = pyth.getUpdateFee(arr);
        require(msg.value >= fee, "INSUFFICIENT_FEE");

        
        pyth.updatePriceFeeds{ value: fee }(arr);
    }

   // for ETH
    function readEthPrice(bytes32 ethUsdId)
      external
      view
      returns (int64 price, int32 expo, uint256 publishTime)
    {
        PythStructs.Price memory p = pyth.getPriceNoOlderThan(ethUsdId, 60);
        return (p.price, p.expo, p.publishTime);
    }
    
   
    function getEthPriceDecimal(bytes32 ethUsdId) 
      external 
      view 
      returns (uint256 scaledPrice) 
    {
        PythStructs.Price memory p = pyth.getPriceNoOlderThan(ethUsdId, 60);
        require(p.price > 0, "INVALID_PRICE");
        
        if (p.expo >= 0) {
            scaledPrice = uint256(uint64(p.price)) * (10 ** uint32(p.expo));
        } else {
            scaledPrice = uint256(uint64(p.price)) / (10 ** uint32(-p.expo));
        }
    }
}