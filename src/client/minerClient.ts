import dotenv from 'dotenv';
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";
import Wallet from '../lib/wallet';
import TransactionType from '../lib/transactionType';
import Transaction from '../lib/transaction';

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = new Wallet(process.env.MINER_WALLET);
console.log('Logged as'+minerWallet.publicKey)

let totalMined = 0;

async function mine() {
    console.log('Getting next block info...');
    const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);
    if(!data) {
        console.log('No block to mine. Waiting 5 seconds...');
        return setTimeout(() => {
            mine();
        }, 5000)
    }
    
    const blockInfo = data as BlockInfo;

    const newBlock = Block.fromBlockInfo(blockInfo);

    newBlock.transactions.push(new Transaction({
        to: minerWallet.publicKey,
        type: TransactionType.FEE,
    } as Transaction));

    newBlock.miner = minerWallet.publicKey;
    newBlock.hash = newBlock.getHash();
    
    console.log("Start mining block #"+ blockInfo.index);
    newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

    console.log('Block mined. Sending to blockchain')

    try {
        await axios.post(`${BLOCKCHAIN_SERVER}blocks/`, newBlock);
        console.log('Block sent and aceepted');
        totalMined++;
        console.log('Total mined blocks', totalMined);
    } catch (err: any) {
        console.log(err.response ? err.response.data : err.message);
    }

    setTimeout(() => {
        mine();
    }, 1000)
}

mine();