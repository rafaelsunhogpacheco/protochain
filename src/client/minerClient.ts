import axios from "axios";
import BlockInfo from "../lib/blockInfo";

const BLOCKCHAIN_SERVER = 'http://localhost:3000/';

async function mine() {
    console.log('Getting next block info...');
    const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);
    const blockInfo = data as BlockInfo;
    
    console.log(data)
}

mine();