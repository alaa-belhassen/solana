const web3 = require("@solana/web3.js");
const  bs58 =require("bs58");
const  hdkey =require("hdkey")
const nacl = require("tweetnacl");

let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
let tosend = web3.Keypair.generate();
let toreceive = web3.Keypair.generate();
async function myFunction() {
    let slot = await connection.getSlot();
    console.log(slot);
    // 93186439
    
    let blockTime = await  connection.getBlockTime(slot);
    console.log(blockTime);
    // 1630747045
    
    let block = await connection.getBlock(slot);
    console.log(block);
    
  }



// Airdrop SOL for paying transactions

//airdrop(tosend.publicKey);





//call methode with url
async function getBalanceUsingJSONRPC(address) {
  const url = web3.clusterApiUrl("devnet");
  console.log(url);
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [address],
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.error) {
        throw json.error;
      }

      return console.log(json["result"]["value"]) ;
    })
    .catch((error) => {
      throw error;
    });
}


async function transactions(){    
  
   const tosendpubKey = new web3.PublicKey("E4H41T3G2gubwFmDAiJxgPPWYEAghYD1C6a5i3LgeEMb");
   const toreceivepubKey= new web3.PublicKey("9YqJzF1af6VPEVDqwcSPXirAxkSuXkQrZvHHs8rfn3HH");
   const toPrivateKey = new Uint8Array(["4gUZJrc45trAQv6yqKQ1TNnCiN9xtZVgSTmgDbYrinBQYrD6RwetX5Afh8AGDu6AAuW2PNVeCAzTr94B9pnamr8n"]);
   console.log(fromKeypair)
   let transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: tosendpubKey,
          toPubkey: toreceivepubKey,
          lamports: 100
        }),
      );
      transaction.feePayer = tosendpubKey;
      transaction.partialSign(fromPrivateKey);
      transaction.partialSign(toPrivateKey);
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromPrivateKey, toPrivateKey],
        { skipPreflight: false }
    );
    console.log(`Transaction ${signature} confirmed`);
      }
  

