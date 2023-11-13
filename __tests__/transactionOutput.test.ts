import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import TransactionInput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';
import TransactionOutput from '../src/lib/transactionOutput';

describe("TransactionOutput tests", () => {

    let alice: Wallet, bob: Wallet;

    beforeAll(() => {
        alice = new Wallet();
        bob = new Wallet();
    })
    
    it('Should be valid', () =>{
        const txOutputs = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: 'abc'
        } as TransactionOutput)
        
        const valid = txOutputs.isValid();
        expect(valid.success).toBeTruthy();
    })

    it('Should NOT be valid', () =>{
        const txOutputs = new TransactionOutput({
            amount: -10,
            toAddress: alice.publicKey,
            tx: 'abc'
        } as TransactionOutput)
        
        const valid = txOutputs.isValid();
        expect(valid.success).toBeFalsy();
    })

    it('Should get hash', () =>{
        const txOutputs = new TransactionOutput({
            amount: 10,
            toAddress: alice.publicKey,
            tx: 'abc'
        } as TransactionOutput)
        
        const hash = txOutputs.getHash();
        expect(hash).toBeTruthy();
    })

    it('Should NOT be valid (default)', () =>{
        const txOutputs = new TransactionOutput()
        const valid = txOutputs.isValid();
        expect(valid.success).toBeFalsy();
    })
})