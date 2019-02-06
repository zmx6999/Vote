pragma solidity ^0.4.0;

contract Vote {
    struct Voter {
        uint candidateNumber;
        bool voted;
        address delegate;
        uint weight;
    }

    struct Candidate {
        string name;
        uint voteCount;
    }

    mapping(address=>Voter) voterList;
    Candidate[] candidateList;

    uint public startTime;
    uint public endTime;
    address public manager;

    uint public winnerIndex;
    uint public winnerVoteCount;

    constructor(uint _startTime,uint _endTime) {
        startTime=_startTime;
        endTime=_endTime;
        manager=msg.sender;
    }

    modifier onlyManager() {
        require(msg.sender==manager);
        _;
    }

    modifier onlyVoter() {
        require(voterList[msg.sender].weight>0);
        _;
    }

    modifier onlyPrepare() {
        require(now<startTime);
        _;
    }

    modifier onlyStart() {
        require(startTime<=now && now<=endTime && candidateList.length>0);
        _;
    }

    modifier onlyEnd() {
        require(now>endTime && candidateList.length>0);
        _;
    }

    function addVoter(address addr) onlyManager onlyPrepare {
        require(addr!=manager);
        require(voterList[addr].weight==0);
        voterList[addr]=Voter({candidateNumber:0,voted:false,delegate:0,weight:1});
    }

    function addCandidate(string name) onlyManager onlyPrepare {
        candidateList.push(Candidate({name:name,voteCount:0}));
    }

    function vote(uint candidateNumber) onlyVoter onlyStart {
        Voter storage voter=voterList[msg.sender];
        require(!voter.voted);
        voter.candidateNumber=candidateNumber;
        voter.voted=true;
        candidateList[candidateNumber].voteCount+=voter.weight;
    }

    function setDelegate(address delegate) onlyVoter onlyStart {
        Voter storage voter=voterList[msg.sender];
        require(!voter.voted);
        require(isValidDelegate(delegate));
        address rootDelegate=findRootDelegate(delegate);
        voter.delegate=rootDelegate;
        voter.voted=true;
        if(voterList[rootDelegate].voted) {
            candidateList[voterList[rootDelegate].candidateNumber].voteCount+=voter.weight;
        } else {
            voterList[rootDelegate].weight+=voter.weight;
        }
    }

    function revealWinner() onlyManager onlyEnd {
        for(uint i=0; i<candidateList.length; i++) {
            if(candidateList[i].voteCount>winnerVoteCount) {
                winnerIndex=i;
                winnerVoteCount=candidateList[i].voteCount;
            }
        }
    }

    function isValidDelegate(address delegate) private view returns (bool) {
        if(voterList[delegate].weight==0) return false;
        address nextDelegate=delegate;
        while(nextDelegate>0) {
            if(nextDelegate==msg.sender) return false;
            nextDelegate=voterList[nextDelegate].delegate;
        }
        return true;
    }

    function findRootDelegate(address delegate) private view returns (address) {
        address rootDelegate=delegate;
        while(voterList[rootDelegate].delegate>0) {
            rootDelegate=voterList[rootDelegate].delegate;
        }
        return rootDelegate;
    }
}
