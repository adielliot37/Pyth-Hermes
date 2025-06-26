import { HermesClient } from "@pythnetwork/hermes-client";
import { Buffer } from "buffer";

async function main() {

  const hermes = new HermesClient("https://hermes.pyth.network");  


  const all20 = [
   
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD
    "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f", // BNB/USD
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
    "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8", // XRP/USD
    "0x150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e", // FIL/USD
    "0x8e860fb74e60e5736b455d82f60b3728049c348e94961add5f961b02fdee2535", // BAT/USD
    "0x3dd2b63686a450ec7290df3a1e0b583c0481f651351edfa7636f39aed55cf8a3", // BCH/USD
    "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419", // BONK/USD
    "0x5cc87aaa7df22e5ac77f6a4bc50569129eb00396fd9fd68569e748e7e96fdf90", // COQ/USD
    "0x2356af9529a1064d41e32d617e2ce1dca5733afa901daba9e2b68dee5d53ecf9", // CAKE/USD
    "0x4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478", // COMP/USD
    "0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd", // DAI/USD
    "0x5cc254b7cb9532df39952aee2a6d5497b42ec2d2330c7b76147f695138dbd9f3", // ENJ/USD
    "0x708bfcf418ead52a408407b039f2c33ce24ddc80d6dcb6d1cffef91c156c80fa", // BGB/USD
    "0x119ff2acf90f68582f5afd6f7d5f12dbae81e4423f165837169d6b94c27fb384", // ALT/USD
    "0xa6e905d4e85ab66046def2ef0ce66a7ea2a60871e68ae54aed50ec2fd96d8584", // MATIC/USD
    "0xc8acad81438490d4ebcac23b3e93f31cdbcb893fcba746ea1c66b89684faae2f", // KCS/USD
    "0x7677dd124dee46cfcd46ff03cf405fb0ed94b1f49efbea3444aadbda939a7ad3", // ARKM/USD
    "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", // LINK/USD
    "0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54", // LTC/USD
  ];

  
  const all20Updates = await hermes.getLatestPriceUpdates(all20, { encoding: "hex" });
  console.log("20-feed VAA size :", all20Updates.binary.data[0].length / 2);
  console.log("Parsed count:", all20Updates.parsed?.length);

 
  const five = all20.slice(0, 5);
  const fiveUpdates = await hermes.getLatestPriceUpdates(five, { encoding: "hex" });
  console.log("5-feed VAA size :", fiveUpdates.binary.data[0].length / 2);
  console.log("Parsed updates:", fiveUpdates.parsed);

 
  const updateDataHex = fiveUpdates.binary.data[0];
  console.log("\nFinal updateData (hex):\n", updateDataHex);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
