const fs = require("fs")
const path = require("path")
const solc = require("solc")
let source = fs.readFileSync(path.join(__dirname,"contracts/Vote.sol"),"utf-8")
module.exports = solc.compile(source,1)["contracts"][":Vote"]
