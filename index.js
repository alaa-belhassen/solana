const {createFile,getLatestConfirmedSignatures ,getBalanceUsingWeb3,getTransactionDetails,getAccountInfo,getTransactions } = require('./solanaweb3');
const {corsOptions} = require("./corsOptions")
const cors = require('cors');
const express = require("express");
const app = express();
const port = 3201;
const NodeCache = require('node-cache');
const cache = new NodeCache();
const fs = require('fs');
const download = require('download');

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
  
app.use(express.json());
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/",async (req, res) => {
  let result =await  getBalanceUsingWeb3(req.body.adress);
  res.status(201).send("result");
});

app.post("/detailsTransaction",async (req,res)=>{
  console.log(req.body)
  let result = await getTransactionDetails(req.body.signature);
  // Optionally, send a response back to the client
  res.send(result);
})


app.post("/historique",async (req, res) => {
  var latest = await getLatestConfirmedSignatures(req.body.adress).signature;
  if(cache.has('uniqueKey') && latest == cache.get('uniqueKey')[0].transaction.signatures[0]){
    console.log('Retrieved value from cache !!'+cache.get('uniqueKey'))
    res.send( cache.get('uniqueKey'))
}else{

    let result = await getTransactions (req.body.adress,req.body.nbr);
    cache.set('uniqueKey', result);
    cache.set('blockHash', result);        
    console.log('Value not present in cache,'
          + ' performing computation')
    res.send(result)
}
  
 });

app.post("/getAccountInfo",async (req,res)=>{
  console.log(req.body)
  let result = await getAccountInfo(req.body.adress);
  // Optionally, send a response back to the client
  res.send(result);
})


app.post("/saveFile",async (req,res)=>{
  console.log(req.body)
  createFile (req.body.publicKey,req.body.secretKey);
  res.download("informations.txt")
})

