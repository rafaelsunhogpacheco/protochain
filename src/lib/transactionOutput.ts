import Validation from "./validation";
import sha256 from "crypto-js/sha256";

export default class TransactionOutput {
    toAddress: string;
    amount: number;
    tx?: string;

    constructor(txOutput?: TransactionOutput) {
        this.toAddress = txOutput?.toAddress || "";
        this.amount = txOutput?.amount || 0;
        this.tx = txOutput?.tx || "";

    }

    isValid() {
        if(this.amount < 1) {
            return new Validation(false, "Invalid amount");
        }
        return new Validation();
    }

    getHash() {
        return sha256(this.toAddress + this.amount).toString();
    }
}