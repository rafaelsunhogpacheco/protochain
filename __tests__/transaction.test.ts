import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';


jest.mock('../src/lib/transactionInput');
jest.mock('../src/lib/transactionOutput');

describe("Transaction tests", () => {

    const exampleDifficulty: number = 1;
    const exampleFee: number = 1;
    const exampleTx: string = 'adc2a48ae16f1b1a1006435c048fde0f822ae7d8f7fbfeec4e00018b749c6026';
    let alice: Wallet, bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    });
    
    it('Should be valid (REGULAR default)', () =>{
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()],
        } as Transaction);
        const valid = tx.isValid(exampleDifficulty, exampleFee);
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (txo hash != tx hash)', () =>{
        const tx = new Transaction({
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()]
        } as Transaction);

        tx.txOutputs[0].tx = 'blabla';

        const valid = tx.isValid(exampleDifficulty, exampleFee);
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
        const valid = tx.isValid(exampleDifficulty, exampleFee);
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
        const valid = tx.isValid(exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should be valid (FEE)', () =>{
        const tx = new Transaction({
            txOutputs: [new TransactionOutput()],
            type: TransactionType.FEE
        } as Transaction);

        tx.txInputs = undefined;
        tx.hash = tx.getHash();

        const valid = tx.isValid(exampleDifficulty, exampleFee);
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (invalid to)', () =>{
        const tx = new Transaction();
        const valid = tx.isValid(exampleDifficulty, exampleFee);
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
        const valid = tx.isValid(exampleDifficulty, exampleFee);
        expect(valid.success).toBeFalsy();
    })

    it('Should get fee', () =>{
        const txIn = new TransactionInput({
            amount: 11,
            fromAddress: alice.publicKey,
            previousTx: exampleTx
        } as TransactionInput);
        txIn.sign(alice.privateKey);

        const txOut = new TransactionOutput({
            amount: 10,
            toAddress: bob.publicKey,
        } as TransactionOutput);

        const tx = new Transaction({
            txInputs: [txIn],
            txOutputs: [txOut],
        } as Transaction);

        const result = tx.getFee();

        expect(result).toBeGreaterThan(0);
    })

    it('Should get fee "0" ', () =>{
        const tx = new Transaction();
        const txIn = undefined;
        const result = tx.getFee();

        expect(result).toEqual(0);
    })

    it('Should create from reward', () =>{
        const tx = Transaction.fromReward({
            amount: 10,
            toAddress: alice.publicKey,
            tx: exampleTx,
        } as TransactionOutput);

        const result = tx.isValid(exampleDifficulty, exampleFee);
    
        expect(result.success).toBeTruthy();
    })

    it('Should NOT be valid (fee excess)', () =>{
        const txOut = new TransactionOutput({
            amount: Number.MAX_VALUE,
            toAddress: bob.publicKey,
        } as TransactionOutput);

        const tx = new Transaction({
            type: TransactionType.FEE,
            txOutputs: [txOut],
        } as Transaction);

        const result = tx.isValid(exampleDifficulty, exampleFee);
        expect(result.success).toBeFalsy();
    })
})