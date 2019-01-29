const Web3=require("web3")
const ganache=require("ganache-cli")
const web3=new Web3(ganache.provider())
let {bytecode,interface}=require("../compile")
const assert=require("assert")
const wait=t => {
    let t1=parseFloat(new Date()/1000)
    let t2
    while (true) {
        t2=parseFloat(new Date()/1000)
        if (t2-t1>=t) return
    }
}
let instance
let accounts
beforeEach(async () => {
    let now=parseInt(new Date()/1000)
    accounts=await web3.eth.getAccounts()
    instance=await new web3.eth.Contract(JSON.parse(interface)).deploy({data:bytecode,arguments:[now+60,now+120]}).send({from:accounts[0],gas:3000000})
})
describe("Vote",() => {
    it("addCandidate onlyManager",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[1],gas:3000000})
    })

    it("addVoter onlyManager",async () => {
        await instance.methods.addVoter(accounts[1]).send({from:accounts[1],gas:3000000})
    })

    it("addVoter voter",async () => {
        await instance.methods.addVoter(accounts[0]).send({from:accounts[0],gas:3000000})
    })

    it("addVoter repeat",async () => {
        await instance.methods.addVoter(accounts[1]).send({from:accounts[0],gas:3000000})
        await instance.methods.addVoter(accounts[1]).send({from:accounts[0],gas:3000000})
    })

    it("vote onlyStart1",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        await instance.methods.vote(0).send({from:accounts[3],gas:3000000})
    })

    it("setDelegate onlyStart1",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
    })

    it("revealWinner onlyEnd",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        await instance.methods.revealWinner().send({from:accounts[0],gas:3000000})
    })

    it("addCandidate onlyPrepare",async () => {
        wait(60)
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
    })

    it("addVoter onlyPrepare",async () => {
        wait(60)
        await instance.methods.addVoter(accounts[1]).send({from:accounts[0],gas:3000000})
    })

    it("vote onlyStart3",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.vote(0).send({from:accounts[3],gas:3000000})
    })

    it("vote onlyVoter",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.vote(0).send({from:accounts[0],gas:3000000})
    })

    it("vote repeat",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.vote(0).send({from:accounts[3],gas:3000000})
        await instance.methods.vote(0).send({from:accounts[3],gas:3000000})
    })

    it("setDelegate onlyStart3",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
    })

    it("setDelegate onlyVoter",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[0],gas:3000000})
    })

    it("setDelegate repeat",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
    })

    it("setDelegate validDelegate",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
        await instance.methods.setDelegate(accounts[3]).send({from:accounts[2],gas:3000000})
        await instance.methods.setDelegate(accounts[2]).send({from:accounts[5],gas:3000000})
    })

    it("setDelegate validDelegate2",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
        await instance.methods.setDelegate(accounts[3]).send({from:accounts[5],gas:3000000})
    })

    it("setDelegate validDelegate3",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[5],gas:3000000})
    })

    it("setDelegate validDelegate4",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate(accounts[0]).send({from:accounts[5],gas:3000000})
    })

    it("setDelegate validDelegate5",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(60)
        await instance.methods.setDelegate("0x0").send({from:accounts[5],gas:3000000})
    })

    it("vote onlyStart2",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(120)
        await instance.methods.vote(0).send({from:accounts[3],gas:3000000})
    })

    it("setDelegate onlyStart2",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(120)
        await instance.methods.setDelegate(accounts[5]).send({from:accounts[3],gas:3000000})
    })

    it("revealWinner onlyEnd2",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(120)
        await instance.methods.revealWinner().send({from:accounts[0],gas:3000000})
    })

    it("revealWinner onlyManager",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})
        wait(120)
        await instance.methods.revealWinner().send({from:accounts[5],gas:3000000})
    })

    it("revealWinner",async () => {
        await instance.methods.addCandidate("Mary").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Alice").send({from:accounts[0],gas:3000000})
        await instance.methods.addCandidate("Tom").send({from:accounts[0],gas:3000000})
        for(let i=1;i<=5;i++) await instance.methods.addVoter(accounts[i]).send({from:accounts[0],gas:3000000})

        wait(60)
        await instance.methods.vote(0).send({from:accounts[3],gas:3000000})
        await instance.methods.setDelegate(accounts[1]).send({from:accounts[2],gas:3000000})
        await instance.methods.vote(2).send({from:accounts[1],gas:3000000})
        await instance.methods.setDelegate(accounts[3]).send({from:accounts[4],gas:3000000})
        await instance.methods.setDelegate(accounts[2]).send({from:accounts[5],gas:3000000})

        wait(60)
        await instance.methods.revealWinner().send({from:accounts[0],gas:3000000})

        let r1=await instance.methods.winnerIndex().call()
        assert(r1,2,"revealWinner error")
        let r2=await instance.methods.winnerVoteCount().call()
        assert(r2,3,"revealWinner error")
    })
})
