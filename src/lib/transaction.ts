import TransactionType from "./transactionType";
import sha256 from 'crypto-js/sha256';
import Validation from "./validation";
import TransactionInput from "./transactionInput";

export default class Transaction {
    type: TransactionType;
    timestamp: number;
    hash: string;
    txInput: TransactionInput
    to: string;

    constructor(tx?: Transaction) {
        this.type = tx?.type || TransactionType.REGULAR;
        this.timestamp = tx?.timestamp || Date.now();
        this.to = tx?.to || "";
        this.hash = tx?.hash || this.getHash();
        this.txInput = new TransactionInput(tx?.txInput) || new TransactionInput();
    }

    getHash(): string {
        return sha256(this.type + + this.txInput.gethash() + this.to + this.timestamp).toString();
    }

    isValid() : Validation {
        if(this.hash !== this.getHash()) {
            return new Validation(false, "Invalid hash.");
        }
        if(!this.to) {
            return new Validation(false, "Invalid to.");
        }
        return new Validation();
    }
}