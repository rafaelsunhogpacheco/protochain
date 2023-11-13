import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import BlockInfo from './blockInfo';
import Transaction from './transaction';
import TransactionType from './transactionType';

export default class Block {
    index: number;
    timestamp: number;
    hash: string;
    previousHash: string;
    transactions: Transaction[];
    nonce: number;
    miner: string;

    constructor(block?: Block) {
        this.index = block?.index || 0;
        this.timestamp = block?.timestamp || Date.now();
        this.previousHash = block?.previousHash || "";
        this.transactions = block?.transactions
            ? block.transactions.map(tx => new Transaction(tx))
            : [] as Transaction[];
        this.nonce = block?.nonce || 0;
        this.miner = block?.miner || "";
        this.hash = block?.hash || this.getHash();
    }

    getHash(): string {
        const txs = this.transactions && this.transactions.length
            ? this.transactions.map(tx => tx.hash).reduce((a,b) => a + b)
            : "";
        return sha256(this.index + txs + this.timestamp + this.previousHash + this.nonce + this.miner).toString();
    }

    mine(difficulty: number, miner: string) {
        this.miner = miner;
        const prefix = new Array(difficulty + 1).join("0");
        console.log('prefix', prefix)

        do {
            this.nonce++;
            this.hash = this.getHash()

        }while (!this.hash.startsWith(prefix))
    }

    isValid(previousHash: string, previousIndex: number, difficulty: number): Validation{

        if(this.transactions && this.transactions.length){
            const feeTxs = this.transactions.filter(tx => tx.type === TransactionType.FEE); 
            if(!feeTxs.length)
                return new Validation(false, "No fee tx.");
            
            if(feeTxs.length > 1)
                return new Validation(false, "Too many fee transactions.");

            if(!feeTxs[0].txOutputs.some(txo => txo.toAddress === this.miner))
                return new Validation(false, "Invalid fee tx differente from miner.");
            
            // TODO colocar validação de quantidade de taxas

            const validations = this.transactions.map(tx => tx.isValid());
            const errors = validations.filter(v => !v.success).map(v => v.message);            
            if(errors.length > 0)
                return new Validation(false, "Invalid block due to invalid tx." + errors.reduce((a,b) => a + b));
        }
        if (previousIndex !== this.index - 1) return new Validation(false, "Invalid Index");
        if (this.timestamp < 1) return new Validation(false, "Invalid Timestamp");
        if (this.previousHash !== previousHash) return new Validation(false, "Invalid Previous Hash");
        if (this.nonce < 1 || !this.miner) return new Validation(false, "No mined.")

        const prefix = new Array(difficulty + 1).join("0");
        if (this.hash !== this.getHash() || !this.hash.startsWith(prefix))
            return new Validation(false, "Invalid hash.");


        return new Validation();
    }

    static fromBlockInfo(blockInfo: BlockInfo): Block {
        const block = new Block();
        block.index = blockInfo.index;
        block.previousHash = blockInfo.previousHash;
        block.transactions = blockInfo.transactions.map(tx => new Transaction(tx));
        return block;
    }
}
