pragma solidity ^0.4.24;

contract Vote {
    struct Voter {
        uint candidateNumber;
        uint weight;
        address delegate;
        bool voted;
    }

    mapping(address=>Voter) voters;

    struct Candidate {
        string name;
        uint voteCount;
    }

    Candidate[] public candidates;

    uint public winnerIndex;
    uint public winnerVoteCount;

    uint public startTime;
    uint public endTime;
    address public manager;

    constructor(uint _startTime,uint _endTime) {
        startTime=_startTime;
        endTime=_endTime;
        manager=msg.sender;
    }

    modifier onlyPrepare() {
        require(now<startTime);
        _;
    }

    modifier onlyStart() {
        require(startTime<=now && now<=endTime && candidates.length>1);
        _;
    }

    modifier onlyEnd() {
        require(now>endTime && candidates.length>1);
        _;
    }

    modifier onlyManager() {
        require(msg.sender==manager);
        _;
    }

    modifier onlyVoter() {
        require(voters[msg.sender].weight>0);
        _;
    }

    function addCandidate(string name) public onlyPrepare onlyManager {
        candidates.push(Candidate({name:name,voteCount:0}));
    }

    function addVoter(address addr) public onlyPrepare onlyManager {
        require(voters[addr].weight==0);
        require(addr!=manager);
        voters[addr]=Voter({candidateNumber:0,weight:1,delegate:0,voted:false});
    }

    function vote(uint candidateNumber) public onlyStart onlyVoter {
        require(!voters[msg.sender].voted);
        voters[msg.sender].candidateNumber=candidateNumber;
        voters[msg.sender].voted=true;
        candidates[candidateNumber].voteCount+=voters[msg.sender].weight;
    }

    function setDelegate(address delegate) public onlyStart onlyVoter {
        require(!voters[msg.sender].voted);
        require(isValidDelegate(delegate));
        address rootDelegate=findRootDelegate(delegate);
        voters[msg.sender].delegate=rootDelegate;
        voters[msg.sender].voted=true;
        if(voters[rootDelegate].voted) {
            candidates[voters[rootDelegate].candidateNumber].voteCount+=voters[msg.sender].weight;
        } else {
            voters[rootDelegate].weight+=voters[msg.sender].weight;
        }
    }

    function revealWinner() public onlyEnd onlyManager {
        for(uint i=0;i<candidates.length;i++) {
            if(candidates[i].voteCount>winnerVoteCount) {
                winnerVoteCount=candidates[i].voteCount;
                winnerIndex=i;
            }
        }
    }

    function isValidDelegate(address delegate) private view returns (bool) {
        if(voters[delegate].weight==0) return false;
        address nextDelegate=delegate;
        while(nextDelegate>0) {
            if(nextDelegate==msg.sender) return false;
            nextDelegate=voters[nextDelegate].delegate;
        }
        return true;
    }

    function findRootDelegate(address delegate) private view returns (address) {
        address rootDelegate=delegate;
        while(voters[rootDelegate].delegate>0) rootDelegate=voters[rootDelegate].delegate;
        return rootDelegate;
    }
}
