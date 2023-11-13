import TransactionType from "./transactionType";
import sha256 from 'crypto-js/sha256';
import Validation from "./validation";
import TransactionInput from "./transactionInput";
import TransactionOutput from "./transactionOutput";

export default class Transaction {
    type: TransactionType;
    timestamp: number;
    hash: string;
    txInputs: TransactionInput[] | undefined;
    txOutputs: TransactionOutput[];

    constructor(tx?: Transaction) {
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();

        this.txInputs = tx?.txInputs
            ? tx.txInputs.map(txi => new TransactionInput(txi))
            : undefined;
        
        this.txOutputs = tx?.txOutputs
            ? tx.txOutputs.map(txo => new TransactionOutput(txo))
            : [];
        
        this.hash = tx?.hash || this.getHash();

        this.txOutputs.forEach((txo, index, arr) => arr[index].tx = this.hash);
    }

    getHash(): string {
        const from = this.txInputs && this.txInputs.length
            ? this.txInputs.map(txi => txi.signature).join(",")
            : "";
        const to = this.txOutputs && this.txOutputs.length
            ? this.txOutputs.map(txi => txi.getHash()).join(",")
            : "";
        return sha256(this.type + from + to + this.timestamp).toString();
    }

    isValid() : Validation {
        if(this.hash !== this.getHash()) 
            return new Validation(false, "Invalid hash.");
        
        if(!this.txOutputs || !this.txOutputs.length || this.txOutputs.map(txo => txo.isValid()).some(v => !v.success))  
            return new Validation(false, "Invalid TXO.");
        

        if(this.txInputs && this.txInputs.length) {
            const validations = this.txInputs.map(txi => txi.isValid()).filter(v => !v.success);
            if(validations && validations.length) {
                const message = validations.map(v => v.message).join(" ");
                return new Validation(false, `Invalid TXI: ${message}`);
            }

            const inputSum = this.txInputs.map(txi => txi.amount).reduce((a, b) => a + b, 0);
            const outputSum = this.txOutputs.map(txo => txo.amount).reduce((a, b) => a + b, 0);
            if(inputSum < outputSum) {
                return new Validation(false, `Invalid TXI: Insufficient funds.`)
            }
        }

        if(this.txOutputs.some(txo => txo.tx !== this.hash))
            return new Validation(false, "Invalid TXO reference hash.");

        // TODO validar as taxas e recompensas quando tx.type === FEE
        
        return new Validation();
    }
}