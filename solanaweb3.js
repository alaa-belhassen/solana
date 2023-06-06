

const web3 = require("@solana/web3.js");
const  bs58 =require("bs58");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const fs = require('fs');

let connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");

async function getTransactions2(address, numTx) {
  const pubKey = new web3.PublicKey(address);
  const cachedTransactions = cache.get(address);
  console.log(cachedTransactions)
  if (cachedTransactions) {
    return cachedTransactions.slice(0, numTx);
  }
  const transactionList = await connection.getSignaturesForAddress(pubKey, { limit: numTx });
  const transactionChunks = [];
  for (let i = 0; i < transactionList.length; i += batchLimit) {
    transactionChunks.push(transactionList.slice(i, i + batchLimit));
  }
  const transactionPromises = transactionChunks.map(async element => {
      const transactions = await connection.getTransaction(element.signature);
      return transactions;
  });
  const transactions = await Promise.all(transactionPromises);
  return transactions;
}

async function getTransactionDetails(signature){
  return    await  connection.getTransaction(signature,{
      maxSupportedTransactionVersion: 0,
    });
    
}

async function getTransactions(address, numTx)
{
  const pubKey = new web3.PublicKey(address);
  let transactionList = await  connection.getSignaturesForAddress(pubKey, {limit:numTx});
  let transactionPromises = transactionList.map((element) => {
    return connection.getTransaction(element.signature,{
      maxSupportedTransactionVersion: 0,
    });
  });
  
   var result = await Promise.all(transactionPromises);
   return result
}


async function createAccount(
  ) {
    const account = new web3.Keypair();
    
    const signature =  await connection.requestAirdrop(
      account.publicKey,
      1000 ,
    );
    
    const latestBlockHash = await connection.getLatestBlockhash();
     connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      }
    );
    console.log(signature)
    console.log(account) ;
    return account;
  }






async function getLatestConfirmedSignatures(publicKey){
  const pubKey = new web3.PublicKey(publicKey);
  const signatures = await connection.getConfirmedSignaturesForAddress2(pubKey, { limit: 1 });
  console.log(signatures)
}
//use @solana/web3
 async function getBalanceUsingWeb3(address ) {
    const publicKey = new web3.PublicKey(address);
    return( connection.getBalance(publicKey) );
  }
  //getAccount info @solana/web3
  async function getAccountInfo(address ) {
    const publicKey = new web3.PublicKey(address);
    return(await connection.getAccountInfo(publicKey,"confirmed"));
  }
  //

  async function airdrop(pubkey) {
    const publicKey = new web3.PublicKey(pubkey);
    console.log(publicKey)
    let airdropSignature = await connection.requestAirdrop(
      publicKey,
      web3.LAMPORTS_PER_SOL,
    );
    
    await connection.confirmTransaction({ signature: airdropSignature });

    console.log("payment received" + airdropSignature);
    }
// get wallet secret pairkey external
    async function  getWalllet (senderPrivateKey)
    {
      const secretKey = Uint8Array.from(bs58.decode(senderPrivateKey));
      const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);
      console.log(keypairFromSecretKey);
    }
//transfer 
async function transfer (sender,receiver,amount){

  const transaction = new web3.Transaction();

  const secretKey = Uint8Array.from(bs58.decode(sender));
  const payerKeys = web3.Keypair.fromSecretKey(secretKey);
  
  const receiverpubKey=new web3.PublicKey(receiver);

  const sendSolInstruction = web3.SystemProgram.transfer({
    fromPubkey: payerKeys.publicKey,
    toPubkey: receiverpubKey,
    lamports: web3.LAMPORTS_PER_SOL * amount,
  });
  transaction.add(sendSolInstruction);
  const signature = await web3.sendAndConfirmTransaction(connection, transaction, [
    payerKeys,
  ]);
  console.log(signature);
};


// the program needs to get deployed to get programId 
async function callProgram(
  connection ,
  payer,
  programId,
  programDataAccount,
) {
  
  const secretKey = Uint8Array.from(bs58.decode(payer));
  const payerKeys = web3.Keypair.fromSecretKey(secretKey);
  const publicKey = new web3.PublicKey(programDataAccount);

  const instruction = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId,
  });

  const signature = await web3.sendAndConfirmTransaction(
    connection,
    new web3.Transaction().add(instruction),
    [payerKeys],
  );

  console.log(signature);
}

async function getTransactionHistory(address) {
  const pubKey = new web3.PublicKey(address);
  const transactionSignatures = await connection.getConfirmedSignaturesForAddress2(pubKey, {
    limit: 20 // You can adjust the limit as per your requirements
  });
  const transactionPromises = transactionSignatures.map((signature) => {
    return connection.getConfirmedTransaction(signature.signature);
  });
  const transactions = await Promise.all(transactionPromises);
  console.log(transactions)
}

function createFile(publicKey,secretKey){
  const file = fs.createWriteStream('informations.txt');
  file.write("publicKey :"+publicKey+"secretKey :"+secretKey);
  
}


//---->>main<<-----//
publicKey="E4H41T3G2gubwFmDAiJxgPPWYEAghYD1C6a5i3LgeEMb";
publickeyReceiver="14dnrdWuC1dhKX7V2jtx2j3BxfPZzoR5J3nF3FfmqDKt";
payerSecret="5RgFKzFXZcqKkjhk2VW9YZSurdxyKqa7djqj7HTgk2M4daBfbGgnqeaSv7jFyJzMYpryyJ7zX54xtEzaP497bt5K";
receiverSecret="4gUZJrc45trAQv6yqKQ1TNnCiN9xtZVgSTmgDbYrinBQYrD6RwetX5Afh8AGDu6AAuW2PNVeCAzTr94B9pnamr8n";
// provided to test :->'question' where can i get them
programId="ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
programDataAdress="Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";
//getLatestConfirmedSignatures(publickeyReceiver);
//airdrop(publicKey,3);
//transfer(payerSecret,publickeyReceiver,1)
//transfer2(payerSecret,publickeyReceiver,1);
//callProgram(connection,payerSecret,programId,programDataAdress);
//getWalllet(payerSecret);   
//airdrop("4d8gEohV2RwA4DJbpfTcEGqRd5h69r2H5Up6VdrRjCvz")
getAccountInfo(publicKey)
//getBalanceUsingWeb3(publicKey)
//getTransactionHistory(publicKey);
//createAccount()
module.exports = {
 getBalanceUsingWeb3,
 getAccountInfo,
 getTransactions,
 getLatestConfirmedSignatures,
 getTransactionDetails,
 createFile
};