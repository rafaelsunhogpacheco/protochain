import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';

describe("Wallett tests", () => {

    const exampleWIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'
    let alice: Wallet;

    beforeAll(() => {
        alice = new Wallet();
    })

    it('Should generate wallet', () =>{

        const wallet = new Wallet();

        expect(wallet.privateKey).toBeTruthy();
        expect(wallet.publicKey).toBeTruthy();
    })

    it('Should recover wallet (PK)', () =>{

        const wallet = new Wallet(alice.privateKey);
        expect(wallet.publicKey).toEqual(alice.publicKey);
    })

    it('Should recover wallet (WIF)', () =>{

        const wallet = new Wallet(exampleWIF);
        expect(wallet.publicKey).toBeTruthy();
        expect(wallet.privateKey).toBeTruthy();
    })

    

    
})