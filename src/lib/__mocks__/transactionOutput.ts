import Validation from "../validation";

export default class TransactionOutput {
    toAddress: string;
    amount: number;
    tx?: string;

    constructor(txOutput?: TransactionOutput) {
        this.toAddress = txOutput?.toAddress || "anc";
        this.amount = txOutput?.amount || 10;
        this.tx = txOutput?.tx || "xyz";

    }

    isValid() {
        if(this.amount < 1) {
            return new Validation(false, "Invalid amount");
        }
        return new Validation();
    }

    getHash() {
        return "abc";
    }
}