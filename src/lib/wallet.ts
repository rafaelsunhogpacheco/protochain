import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';

const ECPair = ECPairFactory(ecc);

export default class Wallet {

    privateKey: string;
    publicKey: string;

    constructor(wifOrPrivatekey?: string) {
        let keys;

        if(wifOrPrivatekey) {
            if(wifOrPrivatekey.length === 64)
                keys = ECPair.fromPrivateKey(Buffer.from(wifOrPrivatekey, 'hex'));
            else
                keys = ECPair.fromWIF(wifOrPrivatekey);
        }else 
            keys = ECPair.makeRandom();
        
        this.privateKey = keys.privateKey?.toString('hex') || "";
        this.publicKey = keys.publicKey.toString('hex');
    }
}