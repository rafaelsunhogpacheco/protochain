import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import Wallet from "../lib/wallet";
import readline from "readline";

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
        rl.question("Select an option: ", (answer) => {
            switch(answer){
                case '1': createWallet();break;
                case '2': recoverWallet();break;
                case '3': getBalance();break;
                case '4': sendTx();break;
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

function getBalance() {
    console.clear();
    console.log("Checking balance...")

    if(!myWalletPub) {
        console.log("You don't have a wallet yet\n");
        return preMenu();
    }
    
    // TODO getBalance via API

    preMenu();
}

function sendTx() {
    console.clear();

    if(!myWalletPub) {
        console.log("You don't have a wallet yet\n");
        return preMenu();
    }
    
    // TODO sendTx via API

    preMenu();
}

menu();