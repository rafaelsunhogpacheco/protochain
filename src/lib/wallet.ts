import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';

const ECPair = ECPairFactory(ecc);

export default class Wallet {

    privateKey: string;
    publicKey: string;

    constructor() {
        const keys = ECPair.makeRandom();
        this.privateKey = keys.privateKey?.toString('hex') || "";
        this.publicKey = keys.publicKey.toString('hex');
    }
}