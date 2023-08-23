import Block from "./block";

export default class Blockchain {
    blocks: Block[];

    constructor() {
        this.blocks = [new Block(0, ""  ,"genesis")];
    }
}