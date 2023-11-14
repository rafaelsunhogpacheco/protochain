import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionOutput from './transactionOutput';

const ECPair = ECPairFactory(ecc);

export default class TransactionInput {
    fromAddress: string;
    amount: number;
    signature: string;
    previousTx: string;

    constructor(txInput?: TransactionInput) {
        this.previousTx = txInput?.previousTx || "";
        this.fromAddress = txInput?.fromAddress || "";
        this.amount = txInput?.amount || 0;
        this.signature = txInput?.signature || "";
        
    }

    sign(privateKey: string): void{
        this.signature = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
            .sign(Buffer.from(this.gethash(), 'hex'))
            .toString('hex');
    }

    gethash(): string {
        return sha256(this.previousTx + this.fromAddress + this.amount).toString();
    }

    isValid(): Validation {
        if(!this.previousTx || !this.signature)
            return new Validation(false, "Signature and PreviousTx are required.");

        if(this.amount < 1)
            return new Validation(false, "Invalid amount.");

        const hash = Buffer.from(this.gethash(), 'hex');
        const isValid = ECPair.fromPublicKey(Buffer.from(this.fromAddress, 'hex'))
            .verify(hash, Buffer.from(this.signature, 'hex'));

        return isValid ? new Validation() : new Validation(false, "Invalid tx input signature.");
    }

    static fromTxo(txo : TransactionOutput) : TransactionInput {
        return new TransactionInput({
            amount: txo.amount,
            fromAddress: txo.toAddress,
            previousTx: txo.tx,
        } as TransactionInput);
    }
}