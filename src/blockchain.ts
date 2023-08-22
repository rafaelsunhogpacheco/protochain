import Block from "./block";

const block1 = new Block();
block1.hash = "a";
block1.index = 1;


console.log(block1)
console.log(block1.isValid())