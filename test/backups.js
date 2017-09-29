
            it("Testing Reward of Reporter in case of truthful reporting", async () => {

              escalationId=await getToEscalationState(ISSUEACCEPTED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);
              await escalationRealitySplit.createChildContracts(escalationId);
              realityTokenChild1=await RealityToken.at(await realityToken.realityChild1.call());
              realityTokenChild2=await RealityToken.at(await realityToken.realityChild2.call());

              //Testing Crediting To Childs
              await escalationRealitySplit.rewardBonders(escalationId,{from:IssueReporter.address});
              assert.equal((await realityTokenChild1.balanceOf.call(IssueReporter.address)),600);
            });

                it("Testing Reward of Reporter in case of non-truthful reporting", async () => {
                  Voters=[{address: accounts[customer2],coinsToBeVoted:90000000,vote:false},{address: accounts[attacker1],coinsToBeVoted:100000000,vote:false},]

                  escalationId=await getToEscalationState(ISSUEDECLINED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);

                  assert.throws(await escalationRealitySplit.rewardBonders(escalationId,{from:IssueReporter.address}));
                  assert.equal((await realityTokenChild1.balanceOf.call(IssueReporter.address)),0);
                });

                it("Testing Reward to Bonders", async () => {

                  escalationId=await getToEscalationState(ISSUEACCEPTED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);
                  realityTokenChild1=await RealityToken.at(await realityToken.realityChild1.call());
                  realityTokenChild2=await RealityToken.at(await realityToken.realityChild2.call());

                  bonderlength=Bonders.length;
                  for(var b=0;b<bonderlength;b++){
                  await escalationRealitySplit.rewardBonders(escalationId,{from:Bonders[b].address});
                  assert.equal((await realityTokenChild1.balanceOf(Bonders[b].address)),Bonders[b].coinsToBeVoted*2);
                  }

                });

                    it("Crediting process to child Contracts", async () => {

                      escalationId=await getToEscalationState(ISSUEACCEPTED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);
                      realityTokenChild1=await RealityToken.at(await realityToken.realityChild1.call());
                      realityTokenChild2=await RealityToken.at(await realityToken.realityChild2.call());

                      tempbalance=await realityToken.balanceOf(accounts[crowdfundcontract]);
                      await realityToken.creditToChilds();
                      assert.equal(String(await realityTokenChild1.balanceOf(accounts[crowdfundcontract])),String(tempbalance));
                      assert.equal(String(await realityTokenChild2.balanceOf(accounts[crowdfundcontract])),String(tempbalance));
                        //Test for more accounts;
                    });

                        it("Escalate the corruptAnswerSending until chainsplit", async () => {

                          escalationId=await getToEscalationState(ISSUEACCEPTED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);
                          realityTokenChild1=await RealityToken.at(await realityToken.realityChild1.call());
                          realityTokenChild2=await RealityToken.at(await realityToken.realityChild2.call());
                          //Testing voting reward distribution
                          await escalationRealitySplit.rewardVoterIsIssue(escalationId,{from:accounts[customer2]});
                          assert.equal(String(await realityTokenChild1.balanceOf(accounts[customer2])),100000000*2);

                          await escalationRealitySplit.rewardVoterIsIssue(escalationId,{from:accounts[attacker1]});
                          assert.equal(String(await realityTokenChild1.balanceOf(accounts[attacker1])),0);

                          await realityToken.creditToChilds({from:accounts[attacker1]});
                          assert.equal(String(await realityTokenChild1.balanceOf(accounts[attacker1])),0);

                          await escalationRealitySplit.rewardVoterIsNoIssue(escalationId,{from:accounts[attacker1]});
                          assert.equal(String(await realityTokenChild1.balanceOf(accounts[attacker1])),0);
                          assert.equal(String(await realityTokenChild2.balanceOf(accounts[attacker1])),100000000*2);

                        });

                            it("Escalatation of the corruptAnswerSending until chainsplit", async () => {

                              escalationId=await getToEscalationState(ISSUEACCEPTED,IssueReporter,Bonders,Voters,escalationRealitySplit,realityToken,corruptAnswerSending,accounts[oracle]);
                              realityTokenChild1=await RealityToken.at(await realityToken.realityChild1.call());
                              realityTokenChild2=await RealityToken.at(await realityToken.realityChild2.call());

                              //Testing Crediting To Childs
                              await escalationRealitySplit.rewardBonders(escalationId,{from:accounts[customer3]});
                              assert.equal((await realityTokenChild1.balanceOf.call(accounts[customer3])),600);

                              await escalationRealitySplit.rewardBonders(escalationId,{from:accounts[customer1]});
                              assert.equal((await realityTokenChild1.balanceOf(accounts[customer1])),100001*2);
                              tempbalance=await realityToken.balanceOf(accounts[crowdfundcontract]);

                              //Testing crediting to child-Realitytokens
                              await realityToken.creditToChilds();
                              assert.equal(String(await realityTokenChild1.balanceOf(accounts[crowdfundcontract])),String(tempbalance));
                              assert.equal(String(await realityTokenChild2.balanceOf(accounts[crowdfundcontract])),String(tempbalance));

                              //Testing voting reward distribution
                              await escalationRealitySplit.rewardVoterIsIssue(escalationId,{from:accounts[customer2]});
                              assert.equal(String(await realityTokenChild1.balanceOf(accounts[customer2])),100000000*2);

                              await escalationRealitySplit.rewardVoterIsIssue(escalationId,{from:accounts[attacker1]});
                              assert.equal(String(await realityTokenChild1.balanceOf(accounts[attacker1])),0);

                              await realityToken.creditToChilds({from:accounts[attacker1]});
                              assert.equal(String(await realityTokenChild1.balanceOf(accounts[attacker1])),0);

                              await escalationRealitySplit.rewardVoterIsNoIssue(escalationId,{from:accounts[attacker1]});
                              assert.equal(String(await realityTokenChild1.balanceOf(accounts[attacker1])),0);
                              assert.equal(String(await realityTokenChild2.balanceOf(accounts[attacker1])),100000000*2);

                            });
