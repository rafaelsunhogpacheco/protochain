import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Wallet from "../lib/wallet";
import readline from "readline";
import Transaction from "../lib/transaction";
import TransactionType from "../lib/transactionType";
import TransactionInput from "../lib/transactionInput";
import TransactionOutput from "../lib/transactionOutput";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = '';
let myWalletPriv = '';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function menu(){
    setTimeout(() => {
        console.clear();

        if(myWalletPub)
            console.log(`Your wallet address: ${myWalletPub}\n`);
        else
            console.log("You don't have a wallet yet\n");
        
        console.log("1. Create a new wallet");
        console.log("2. Recover Wallet");
        console.log("3. Balance");
        console.log("4. Send transaction");
        console.log("5. Search tx");
        rl.question("Select an option: ", (answer) => {
            switch(answer){
                case '1': createWallet();break;
                case '2': recoverWallet();break;
                case '3': getBalance();break;
                case '4': sendTx();break;
                case '5': searchTx();break;
                default: {
                    console.log("Invalid option");
                    menu();
                }
            }
        });
    }, 1000);
}

function preMenu(){
    rl.question("Press any key to continue...", () => {
        menu();
    });
}

function createWallet() {
    console.clear();
    console.log("Creating a new wallet...")
    const wallet = new Wallet();
    console.log(`Your wallet`);
    console.log(wallet);

    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;

    preMenu();
};

function recoverWallet() {
    console.clear();
    console.log("Recovering wallet...")
    rl.question("Enter your private key: ", (wifOrPrivateKey) => {
        const wallet = new Wallet(wifOrPrivateKey);
        console.log(`Your recovered wallet`);
        console.log(wallet);

        myWalletPub = wallet.publicKey;
        myWalletPriv = wallet.privateKey;
        preMenu();
    });
}

async function getBalance() {
    console.clear();
    console.log("Checking balance...")

    if(!myWalletPub) {
        console.log("You don't have a wallet yet\n");
        return preMenu();
    }
    
    const {data} = await axios.get(`${BLOCKCHAIN_SERVER}wallets/${myWalletPub}`);
    console.log("Balance: ",data.balance)

    preMenu();
}

function sendTx() {
    console.clear();

    if(!myWalletPub) {
        console.log("You don't have a wallet yet\n");
        return preMenu();
    }
    
    console.log(`Your wallet address: ${myWalletPub}\n`);
    rl.question(`To wallet:`, (toWallet) => {
        if(toWallet.length < 66) {
            console.log("Invalid wallet address");
            return preMenu();
        }

        rl.question(`Amount:`, async (amountStr) => {
            const amount = parseInt(amountStr);

            if(!amount) {
                console.log("Invalid amount");
                return preMenu();
            }

            const walletResponse = await axios.get(`${BLOCKCHAIN_SERVER}wallets/${myWalletPub}`);
            const balance = walletResponse.data.balance as number;
            const fee = walletResponse.data.fee as number;
            const utxo = walletResponse.data.utxo as TransactionOutput[];

            if(balance < amount + fee) {
                console.log("Insufficient balance (tx + fee)");
                return preMenu();
            }

            const txInputs = utxo.map(txo => TransactionInput.fromTxo(txo));
            txInputs.forEach((txi, index, arr) => arr[index].sign(myWalletPriv));

            // transação de transferência
            const txOutputs = [] as TransactionOutput[];
            txOutputs.push(new TransactionOutput({
                toAddress: toWallet,
                amount,
            } as TransactionOutput));

            // transação de troco
            const remainingBalance = balance - amount - fee;
            txOutputs.push(new TransactionOutput({
                toAddress: myWalletPub,
                amount: remainingBalance,
            } as TransactionOutput));

            const tx = new Transaction({
                txInputs,
                txOutputs
            } as Transaction)
            
            tx.hash = tx.getHash();
            tx.txOutputs.forEach((txo, index, arr) => arr[index].tx = tx.hash);

            console.log(tx);
            console.log("Remaning balance: ", remainingBalance);

            try{
                const txResponse = await axios.post(`${BLOCKCHAIN_SERVER}transactions`, tx);
                console.log(`Transaction accepted. Witing fot the miners.`)
                console.log(txResponse.data.hash);

            } catch(err: any) {
                console.error(err.response ? err.response.data : err.message);
            }

            return preMenu();
        });
    })

    preMenu();
}

function searchTx() {
    console.clear();
    rl.question(`Enter the transaction hash:`, async (hash) => {
        const response = await axios.get(`${BLOCKCHAIN_SERVER}transactions/${hash}`);
        console.log(response.data);
        return preMenu();
    });
}

menu();