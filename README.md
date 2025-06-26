# Pyth Feed Fetch & Update



1. **Fetches & decodes** the latest VAA (price update) for 5 selected feeds out of 20 via Pyth’s Hermes API.  
2. **Re-encodes** those 5 updates into a new VAA hex blob ready for on-chain delivery.  
3. **Calculates & pays** the exact `getUpdateFee` on Pyth’s core contract.  
4. **Submits** the blob via a `PythUpdater` wrapper and  
5. **Verifies** the on-chain price matches the decoded value.

## How It Works

### Decode
- Call `HermesClient.getLatestPriceUpdates([...], { encoding: "hex" })`
- Inspect the `.parsed` field for each feed’s `price`, `expo`, `id`, etc.

### Encode
- Slice your 5 IDs and fetch a new VAA from Hermes for just those feeds
- Hermes returns a valid, guardians-signed hex blob

### On-chain
- Query `getUpdateFee([blob])` on the Pyth core contract
- Call `PythUpdater.updateFeeds(blob)` with exactly that fee
- Read back the price via `readEthPrice(id)` to confirm



##  How to Run

1. **Install dependencies**  
   ```bash
   npm install @pythnetwork/hermes-client ethers dotenv ts-node typescript
   ```
2. **Create a .env file in the /**
    ```bash
   RPC_URL=<your JSON-RPC URL>
   PRIVATE_KEY=0x<your private key>
   UPDATER_CONTRACT=deployed_contract_address
   PYTH_CORE=0x<Pyth price-feeds core address>
    ```

3. **Install dependencies**
   ```bash
   npx ts-node .\src\fetchandupdate.ts
   ```
![image](https://github.com/user-attachments/assets/5d3dd9d5-9e11-4d7c-a504-4e2ed208a604)



   
   
