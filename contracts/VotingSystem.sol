pragma solidity ^0.4.17;

contract VotingSystem {

    address electionOfficer;

    uint numCandidates;
    uint numVoters;
    uint numVotes = 0;

    mapping (uint => Candidate) candidates;
    mapping (uint => Voter) voters;
    mapping (uint => Vote) votes;

    function VotingSystem() public{
        electionOfficer = msg.sender;
    }

    struct Voter {
        string voterName;
        bool exist;
    }

    struct Candidate {
        string candidateName;
        string partyName;
        bool exist;
    }

    struct Vote {
       uint candidateID;
       bool exist;
    }

    modifier restricted(){
        require(msg.sender == electionOfficer);
        _;
    }

    function createCandidate(string candidateName, string partyName) public restricted{
        uint candidateID = numCandidates++;

        candidates[candidateID] = Candidate(candidateName,partyName,true);
    }

    function createVoter(string voterName) public restricted{
        uint voterID = numVoters++;

        voters[voterID] = Voter(voterName,true);
    }

    function vote(uint voterID, uint candidateID) public {
        require (candidates[candidateID].exist == true && voters[voterID].exist == true);
        require (votes[voterID].exist == false);
        numVotes++;
        votes[voterID] = Vote(candidateID, true);
    }

    function totalVotesPerCandidate(uint candidateID) view public returns (uint) {
        uint numOfVotes = 0;
        for (uint i = 0; i < numVotes; i++) {

            if (votes[i].candidateID == candidateID) {
                numOfVotes++;
            }
        }
        return numOfVotes;
    }

    function pickTheWinner()  view public restricted returns (uint) {
        uint numOfVotes = 0;
        uint winnerVotes = 0;
        uint winnerCandidateId;

        for (uint i = 0; i < numVotes; i++) {
           for (uint j = 0; j < numVotes; j++){
               if (votes[i].candidateID == votes[j].candidateID) {
                    numOfVotes++;
               }

           }

           if(numOfVotes > winnerVotes){
               winnerVotes = numOfVotes;
               winnerCandidateId = votes[i].candidateID;
               numOfVotes = 0;
           }

        }

        return winnerCandidateId;
    }

    function getNumOfCandidates() public view returns(uint) {
        return numCandidates;
    }

    function getNumOfVoters() public view returns(uint) {
        return numVoters;
    }

    function getTotalNumOfVotes() public view returns(uint) {
        return numVotes;
    }

    function getCandidateDetail(uint candidateID) public view returns (uint,string, string) {
        return (candidateID,candidates[candidateID].candidateName,candidates[candidateID].partyName);
    }

    function getVoterDetail(uint voterID) public view returns (uint,string) {
        return (voterID, voters[voterID].voterName);
    }
}
