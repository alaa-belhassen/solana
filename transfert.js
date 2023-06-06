const borsh=require('@project-serum/borsh');
const web3=require('@solana/web3.js');
const  bs58 =require("bs58");
const dropList= [
  {
    walletAddress: '4d8gEohV2RwA4DJbpfTcEGqRd5h69r2H5Up6VdrRjCvz',
    numLamports: 10
  },
  {
    walletAddress: '14dnrdWuC1dhKX7V2jtx2j3BxfPZzoR5J3nF3FfmqDKt',
    numLamports: 10
  },
] 
payerSecret="5RgFKzFXZcqKkjhk2VW9YZSurdxyKqa7djqj7HTgk2M4daBfbGgnqeaSv7jFyJzMYpryyJ7zX54xtEzaP497bt5K";
payer2Secret="4gUZJrc45trAQv6yqKQ1TNnCiN9xtZVgSTmgDbYrinBQYrD6RwetX5Afh8AGDu6AAuW2PNVeCAzTr94B9pnamr8n";
let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");


const secretKey = Uint8Array.from(bs58.decode(payerSecret));
const FROM_KEY_PAIR = web3.Keypair.fromSecretKey(secretKey);
const secretKey2 = Uint8Array.from(bs58.decode(payer2Secret));
const FROM_KEY_PAIR2 = web3.Keypair.fromSecretKey(secretKey2);
const NUM_DROPS_PER_TX = 10; 
const TX_INTERVAL = 1000;

function generateTransactions(batchSize, dropList, fromWallet){
  let result = [];
  let txInstructions = dropList.map(drop => {return web3.SystemProgram.transfer({
    fromPubkey: fromWallet,
    toPubkey: new web3.PublicKey(drop.walletAddress),
    lamports: drop.numLamports
  })}) ;

  const numTransactions = Math.ceil(txInstructions.length / batchSize);
    for (let i = 0; i < numTransactions; i++){
        let bulkTransaction = new web3.Transaction();
        let lowerIndex = i * batchSize;
        let upperIndex = (i+1) * batchSize;
        for (let j = lowerIndex; j < upperIndex; j++){
            if (txInstructions[j]) 
              bulkTransaction.add(txInstructions[j]);  
        }
        result.push(bulkTransaction);
    }
    console.log(result)
   return result;
}
async function executeTransactions(solanaConnection, transactionList, payer ,payer2) {
  let result = [];
  let staggeredTransactions= transactionList.map((transaction, i, allTx) => {
      return (new Promise((resolve) => {
          setTimeout(() => {
              console.log(`Requesting Transaction ${i+1}/${allTx.length}`);                
              solanaConnection.getLatestBlockhash()
                  .then(recentHash=>transaction.recentBlockhash = recentHash.blockhash)
                  .then(()=>web3.sendAndConfirmTransaction(solanaConnection,transaction,[payer,payer2])).then(resolve);
          }, i * TX_INTERVAL);
       })
  )})
  result = await Promise.allSettled(staggeredTransactions);
  return result;
}
(async () => {
  console.log(`Initiating SOL drop from ${FROM_KEY_PAIR.publicKey.toString()}`);
  const transactionList = generateTransactions(NUM_DROPS_PER_TX,dropList,FROM_KEY_PAIR2.publicKey);
  const txResults = await executeTransactions(connection,transactionList,FROM_KEY_PAIR,FROM_KEY_PAIR2);
  console.log(txResults);
})()
getTransactions("14dnrdWuC1dhKX7V2jtx2j3BxfPZzoR5J3nF3FfmqDKt");
