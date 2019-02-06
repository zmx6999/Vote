const path=require('path')
const fs=require('fs')
let source=fs.readFileSync(path.join(__dirname,'contracts/Vote.sol'),'utf-8')
const solc=require('solc')
module.exports=solc.compile(source,1)['contracts'][':Vote']
