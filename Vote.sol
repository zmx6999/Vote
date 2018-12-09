pragma solidity ^0.4.24;

contract StringUtils {
    function isBytesEqual(bytes bsrc,bytes bdst) internal pure returns (bool) {
        if(bsrc.length!=bdst.length) return false;
        for(uint i=0;i<bsrc.length && i<bdst.length;i++)
            if(bsrc[i]!=bdst[i]) return false;
        return true;
    }

    function find(string src,string dst) internal view returns (uint[]) {
        bytes memory bsrc=bytes(src);
        bytes memory bdst=bytes(dst);
        uint bsrclen=bsrc.length;
        uint bdstlen=bdst.length;
        uint[] indexs;
        for(uint i=0;i<bsrclen;) {
            if(bdstlen>0) {
                uint t=i+bdstlen;
                if(t<=bsrclen && t>=i && t>=bdstlen) {
                    bytes memory bt=new bytes(bdstlen);
                    for(uint j=0;j<bdstlen;j++) bt[j]=bsrc[i+j];
                    if(isBytesEqual(bt,bdst)) indexs.push(i);
                    i=t;
                } else {
                    i++;
                }
            } else {
                indexs.push(i);
                i++;
            }
        }
        indexs.push(bsrclen);
        return indexs;
    }

    function split(string src,string delimiter) internal view returns (string[]) {
        uint[] memory indexs=find(src,delimiter);
        string[] memory parts=new string[](indexs.length);
        uint dlen=bytes(delimiter).length;
        bytes memory bsrc=bytes(src);
        for(uint i=0;i<parts.length;i++) {
            bytes memory bt;
            uint j;
            if(i>0) {
                bt=new bytes(indexs[i]-indexs[i-1]-dlen);
                for(j=0;j<bt.length;j++) bt[j]=bsrc[indexs[i-1]+dlen+j];
                parts[i]=string(bt);
            } else {
                bt=new bytes(indexs[i]);
                for(j=0;j<bt.length;j++) bt[j]=bsrc[j];
                parts[i]=string(bt);
            }
        }
        return parts;
    }
}

contract Vote is StringUtils {

    struct Voter {
        uint voteNumber;
        uint weight;
        address delegate;
        bool voted;
    }

    struct Candidate {
        string name;
        uint voteCount;
    }

    mapping(address=>Voter) public voters;
    Candidate[] public candidates;

    address public manager;

    uint public starttime;
    uint public endtime;

    constructor(string candidateNames,uint _starttime,uint _endtime) public {
        string[] memory candidateNameArr=split(candidateNames,",");
        for(uint i=0;i<candidateNameArr.length;i++)
            candidates.push(Candidate({name:candidateNameArr[i],voteCount:0}));
        manager=msg.sender;
        starttime=_starttime;
        endtime=_endtime;
    }

    modifier onlyManager() {
        require(msg.sender==manager);
        _;
    }

    modifier onlyPrepare() {
        require(now<starttime);
        _;
    }

    modifier onlyStart() {
        require(now>=starttime && now<=endtime);
        _;
    }

    function addVoter(address addr) public onlyManager onlyPrepare {
        if(voters[addr].weight>0) revert();
        if(addr==msg.sender) revert();
        voters[addr].weight=1;
    }

    function vote(uint voteNumber) public onlyStart {
        Voter voter=voters[msg.sender];
        assert(voter.weight>0 && !voter.voted);
        voter.voteNumber=voteNumber;
        voter.voted=true;
        candidates[voteNumber].voteCount+=voter.weight;
    }

    function setDelegate(address delegate) public onlyStart {
        Voter voter=voters[msg.sender];
        assert(voter.weight>0 && !voter.voted);
        assert(isValidDelegate(delegate));
        address to=delegate;
        while(voters[to].delegate!=0x0) {
            to=voters[to].delegate;
        }
        voter.delegate=to;
        voter.voted=true;
        if(voters[to].voted) {
            candidates[voters[to].voteNumber].voteCount+=voter.weight;
        } else {
            voters[to].weight+=voter.weight;
        }
    }

    function getWinner() public view returns (string,uint) {
        uint winnerIndex=0;
        uint maxVoteCount=0;
        for(uint i=0;i<candidates.length;i++)
            if(candidates[i].voteCount>maxVoteCount) {
                winnerIndex=i;
                maxVoteCount=candidates[i].voteCount;
            }
        return (candidates[winnerIndex].name,maxVoteCount);
    }

    function isValidDelegate(address delegate) private view returns (bool) {
        if(voters[delegate].weight==0) return false;
        address to=delegate;
        while(to!=0x0) {
            if(to==msg.sender) return false;
            to=voters[to].delegate;
        }
        return true;
    }
}