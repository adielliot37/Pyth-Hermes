import { HermesClient } from "@pythnetwork/hermes-client";
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  getBytes,
  formatEther,
} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {

  const RPC_URL      = process.env.RPC_URL!;
  const PRIVATE_KEY  = process.env.PRIVATE_KEY!;
  const UPDATER_ADDR = process.env.UPDATER_CONTRACT!;
  const PYTH_CORE    = process.env.PYTH_CORE!;

 
  const ETH_USD_ID  = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
  const ETH_USD_RAW = ETH_USD_ID.slice(2).toLowerCase();

  // Fetch & Parse
  const hermes = new HermesClient("https://hermes.pyth.network");
  const all20 = [
    ETH_USD_ID,
    "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f",
    "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8",
    "0x150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e",
    "0x8e860fb74e60e5736b455d82f60b3728049c348e94961add5f961b02fdee2535",
    "0x3dd2b63686a450ec7290df3a1e0b583c0481f651351edfa7636f39aed55cf8a3",
    "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
    "0x5cc87aaa7df22e5ac77f6a4bc50569129eb00396fd9fd68569e748e7e96fdf90",
    "0x2356af9529a1064d41e32d617e2ce1dca5733afa901daba9e2b68dee5d53ecf9",
    "0x4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478",
    "0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd",
    "0x5cc254b7cb9532df39952aee2a6d5497b42ec2d2330c7b76147f695138dbd9f3",
    "0x708bfcf418ead52a408407b039f2c33ce24ddc80d6dcb6d1cffef91c156c80fa",
    "0x119ff2acf90f68582f5afd6f7d5f12dbae81e4423f165837169d6b94c27fb384",
    "0xa6e905d4e85ab66046def2ef0ce66a7ea2a60871e68ae54aed50ec2fd96d8584",
    "0xc8acad81438490d4ebcac23b3e93f31cdbcb893fcba746ea1c66b89684faae2f",
    "0x7677dd124dee46cfcd46ff03cf405fb0ed94b1f49efbea3444aadbda939a7ad3",
    "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
    "0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54",
  ];

  const fiveIds    = all20.slice(0, 5);
  const fiveUpdate = await hermes.getLatestPriceUpdates(fiveIds, { encoding: "hex" });

  console.log("\nParsed Hermes API updates for 5 feeds:\n",
    JSON.stringify(fiveUpdate.parsed, null, 2)
  );

 // for ETH
  const ethEntry = fiveUpdate.parsed!.find(e => e.id.toLowerCase() === ETH_USD_RAW)!;
  const rawPrice = BigInt(ethEntry.price.price);
  const expoBI   = BigInt(ethEntry.price.expo);
  const expo     = Number(expoBI);
  const scaled   = expo >= 0
    ? rawPrice * (10n ** BigInt(expo))
    : rawPrice / (10n ** BigInt(-expo));

  console.log("\nAPI ETH/USD raw:", rawPrice.toString());

  console.log("API ETH/USD scaled:", scaled.toString());

  // encoded data
  const updateDataHex = fiveUpdate.binary.data[0];
  console.log("\nRe-encoded updateData (hex):", updateDataHex);

 
  const provider = new JsonRpcProvider(RPC_URL);
  const signer   = new Wallet(PRIVATE_KEY, provider);

  // Pyth fee
  const pythCore = new Contract(
    PYTH_CORE,
    ["function getUpdateFee(bytes[] calldata) view returns (uint256)"],
    signer
  );
  const updateBytes = getBytes("0x" + updateDataHex);
  const feeBn       = await pythCore.getUpdateFee([updateBytes]);
  console.log("\nfee:", formatEther(feeBn), "ETH");

  // Submit
  const updater = new Contract(
    UPDATER_ADDR,
    [
      "function updateFeeds(bytes calldata updateData) external payable",
      "function readEthPrice(bytes32) view returns (int64,int32,uint256)"
    ],
    signer
  );

  const tx = await updater.updateFeeds(updateBytes, { value: feeBn });
  console.log("\nTx hash:", tx.hash);
  await tx.wait();
  console.log("updateFeeds succeeded");

  // rechecking 
  const [onRaw, onExpoBI, onTsBI]: [bigint, bigint, bigint] =
    await updater.readEthPrice(ETH_USD_ID);

  const onExpo   = Number(onExpoBI);
  const onScaled = onExpo >= 0
    ? onRaw * (10n ** BigInt(onExpo))
    : onRaw / (10n ** BigInt(-onExpo));

  console.log("\nETH/USD raw:", onRaw.toString());
  console.log("ETH/USD expo:", onExpo);
  console.log("scaled:", onScaled.toString());
  console.log("On-chain timestamp:", onTsBI.toString());
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});