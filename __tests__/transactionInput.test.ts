import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';
import TransactionOutput from '../src/lib/transactionOutput';

describe("TransactionInput tests", () => {

    let alice: Wallet, bob: Wallet;
    const exampleTx: string = 'adc2a48ae16f1b1a1006435c048fde0f822ae7d8f7fbfeec4e00018b749c6026';

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    })
    
    it('Should be valid', () =>{
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: 'xyz',
        } as TransactionInput)
        txInput.sign(alice.privateKey)

        const valid = txInput.isValid();
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid (defaults)', () =>{
        const txInput = new TransactionInput()
        txInput.sign(alice.privateKey)

        const valid = txInput.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT  be valid (empty signature)', () =>{
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: 'abc',
        } as TransactionInput)

        const valid = txInput.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT  be valid (negative amount)', () =>{
        const txInput = new TransactionInput({
            amount: -10,
            fromAddress: alice.publicKey,
            previousTx: 'abc',
        } as TransactionInput)
        txInput.sign(alice.privateKey)

        const valid = txInput.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT  be valid (invalid signature)', () =>{
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
            previousTx: 'abc',
        } as TransactionInput)
        txInput.sign(bob.privateKey)

        const valid = txInput.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should NOT  be valid (invalid previousTx)', () =>{
        const txInput = new TransactionInput({
            amount: 10,
            fromAddress: alice.publicKey,
        } as TransactionInput)
        txInput.sign(alice.privateKey)

        const valid = txInput.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should create from TXO', () =>{
        const txi = TransactionInput.fromTxo({
            amount: 10,
            toAddress: alice.publicKey,
            tx: exampleTx,
        } as TransactionOutput)
        txi.sign(alice.privateKey)

        txi.amount = 11;
        const result = txi.isValid();
        expect(result.success).toBeFalsy();
    })
})