import Validation from '../validation';

export default class TransactionInput {
    fromAddress: string;
    amount: number;
    signature: string;
    previousTx: string;

    constructor(txInput?: TransactionInput) {
        this.previousTx = txInput?.previousTx || "xyz";
        this.fromAddress = txInput?.fromAddress || "carteira1";
        this.amount = txInput?.amount || 10;
        this.signature = txInput?.signature || "abc";   
    }

    sign(privateKey: string): void{
        this.signature = 'abc';
    }

    gethash(): string {
        return 'abc';
    }

    isValid(): Validation {
        if(!this.previousTx || !this.signature)
            return new Validation(false, "Signature and PrevisouTx are required.");

        if(this.amount < 1)
            return new Validation(false, "Invalid amount.");

        return new Validation();
    }
}