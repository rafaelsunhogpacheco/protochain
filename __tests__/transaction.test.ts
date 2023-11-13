import { describe, it, expect, jest } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';

jest.mock('../src/lib/transactionInput');
jest.mock('../src/lib/transactionOutput');

describe("Transaction tests", () => {
    
    it('Should be valid (REGULAR default)', () =>{
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()],
        } as Transaction);
        const valid = tx.isValid();
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (txo hash != tx hash)', () =>{
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()]
        } as Transaction);

        tx.txOutputs[0].tx = 'blabla';

        const valid = tx.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (input < output)', () =>{
        const tx = new Transaction({
            txInputs: [new TransactionInput({
                amount: 1,
            } as TransactionInput)],
            txOutputs: [new TransactionOutput({
                amount: 2,
            } as TransactionOutput)],
        } as Transaction);
        const valid = tx.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (invalid hash)', () =>{
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()],
            type: TransactionType.REGULAR,
            timestamp: Date.now(),
            hash: 'abc'
        } as Transaction);
        const valid = tx.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should be valid (FEE)', () =>{
        const tx = new Transaction({
            txOutputs: [new TransactionOutput()],
            type: TransactionType.FEE
        } as Transaction);

        tx.txInputs = undefined;
        tx.hash = tx.getHash();

        const valid = tx.isValid();
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (invalid to)', () =>{
        const tx = new Transaction();
        const valid = tx.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT be valid (invalid txInput)', () =>{
        const tx = new Transaction({
            txOutputs: [new TransactionOutput()],
            txInputs: [new TransactionInput({
                amount: -10,
                fromAddress: 'carteiraFrom',
                signature: 'abc',
            } as TransactionInput)]
        } as Transaction);
        const valid = tx.isValid();
        expect(valid.success).toBeFalsy();
    })
})