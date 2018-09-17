const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require ('../compile.js');

let accounts;
let votingSystem;

beforeEach(async () => {
  // Get a list of all account
  accounts = await web3.eth.getAccounts();
  //console.log('Accounts: ' + accounts);

  // Use one of the accounts to deploy contract
  votingSystem = await new web3.eth.Contract(JSON.parse(interface))
          .deploy({data: bytecode})
          .send({from: accounts[0], gas: '5000000'});
});

describe('VotingSystem', ()=>{
  // Test case-1 --> Logs the deployed address of the contract
  it('Deploys a contract', () =>{
    assert.ok(votingSystem.options.address);
  });

  // Test case-2 --> Only ElectionOfficer can create a candidate's entry
  it('Only ElectionOfficer can create a candidate', async() => {
      try{
        await votingSystem.methods.createCandidate('ABC','PARTY-1').send({from: accounts[1], gas:3000000});
        assert(false);
      }catch(err){
        assert(err);
      }
  });

  // Test case-3 --> Only ElectionOfficer can create a voter's entry
  it('Only ElectionOfficer can create a voter', async() => {
      try{
        await votingSystem.methods.createVoter('abc').send({from: accounts[1], gas:3000000});
        assert(false);
      }catch(err){
        assert(err);
      }
  });

  // Test case-4 --> Allows multiple candidates to be created by ElectionOfficer
  it('Allows multiple candidates to be created by ElectionOfficer', async() => {
      //balance = await web3.eth.getBalance(accounts[0]);
      //console.log('balance : ' +balance);
  		await votingSystem.methods.createCandidate('ABC','PARTY-1').send({from: accounts[0], gas:3000000});
  		await votingSystem.methods.createCandidate('DEF','PARTY-2').send({from: accounts[0], gas:3000000});

  		const numberOfCandidates= await votingSystem.methods.getNumOfCandidates().call({from: accounts[0]});
  		assert.equal(2, numberOfCandidates);
	});

  // Test case-5 --> Allows multiple voters to be created by ElectionOfficer
  it('Allows multiple voters to be created by ElectionOfficer', async() => {
      await votingSystem.methods.createVoter('abc').send({from: accounts[0]});
      await votingSystem.methods.createVoter('def').send({from: accounts[0]});
      await votingSystem.methods.createVoter('ghi').send({from: accounts[0]});
      await votingSystem.methods.createVoter('jkl').send({from: accounts[0]});
      await votingSystem.methods.createVoter('mno').send({from: accounts[0]});

      const numberOfVoters= await votingSystem.methods.getNumOfVoters().call({from: accounts[0]});
      assert.equal(5, numberOfVoters);
  });

  // Test case-6 --> Allows casting of votes
  it('Allows casting of votes', async() => {
      await votingSystem.methods.createCandidate('ABC','PARTY-1').send({from: accounts[0], gas:3000000});
      await votingSystem.methods.createCandidate('DEF','PARTY-2').send({from: accounts[0], gas:3000000});

      const numberOfCandidates= await votingSystem.methods.getNumOfCandidates().call({from: accounts[0]});
      assert.equal(2, numberOfCandidates);

      await votingSystem.methods.createVoter('abc').send({from: accounts[0]});
      await votingSystem.methods.createVoter('def').send({from: accounts[0]});
      await votingSystem.methods.createVoter('ghi').send({from: accounts[0]});
      await votingSystem.methods.createVoter('jkl').send({from: accounts[0]});
      await votingSystem.methods.createVoter('mno').send({from: accounts[0]});

      const numberOfVoters= await votingSystem.methods.getNumOfVoters().call({from: accounts[0]});
      assert.equal(5, numberOfVoters);

      await votingSystem.methods.vote(0,1).send({from: accounts[0]});
      await votingSystem.methods.vote(1,1).send({from: accounts[0]});
      await votingSystem.methods.vote(2,1).send({from: accounts[0]});
      await votingSystem.methods.vote(3,0).send({from: accounts[0]});
      await votingSystem.methods.vote(4,0).send({from: accounts[0]});

      const numberOfVotes= await votingSystem.methods.getTotalNumOfVotes().call({from: accounts[0]});
      assert.equal(5, numberOfVotes);
  });

  // Test case-7 --> Allows to pick the winner
  it('Allows to pick the winner', async() => {
      await votingSystem.methods.createCandidate('ABC','PARTY-1').send({from: accounts[0], gas:3000000});
      await votingSystem.methods.createCandidate('DEF','PARTY-2').send({from: accounts[0], gas:3000000});

      const numberOfCandidates= await votingSystem.methods.getNumOfCandidates().call({from: accounts[0]});
      assert.equal(2, numberOfCandidates);

      await votingSystem.methods.createVoter('abc').send({from: accounts[0]});
      await votingSystem.methods.createVoter('def').send({from: accounts[0]});
      await votingSystem.methods.createVoter('ghi').send({from: accounts[0]});
      await votingSystem.methods.createVoter('jkl').send({from: accounts[0]});
      await votingSystem.methods.createVoter('mno').send({from: accounts[0]});

      const numberOfVoters= await votingSystem.methods.getNumOfVoters().call({from: accounts[0]});
      assert.equal(5, numberOfVoters);

      await votingSystem.methods.vote(0,1).send({from: accounts[0]});
      await votingSystem.methods.vote(1,1).send({from: accounts[0]});
      await votingSystem.methods.vote(2,0).send({from: accounts[0]});
      await votingSystem.methods.vote(3,0).send({from: accounts[0]});
      await votingSystem.methods.vote(4,0).send({from: accounts[0]});

      const numberOfVotes= await votingSystem.methods.getTotalNumOfVotes().call({from: accounts[0]});
      assert.equal(5, numberOfVotes);

      const winnerCandidateID= await votingSystem.methods.pickTheWinner().call({from: accounts[0]});
      assert.equal(0, winnerCandidateID);
  });
  
});
