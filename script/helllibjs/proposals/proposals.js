(function(app){
    var module={}
    
    class Proposal{
        constructor(submit){
            this.Submit=submit
        }
        Submit=null
    }
    class Proposals{
        #registered={}
        Register(id,Proposal){
            this.#registered[id]=Proposal
        }
        NewProposal(submit){
            return new Proposal(submit)
        }
        NewProposalGroup(...idlist){
            return new Proposal(function(proposals,excluded){
                let tocheck=[...idlist]
                while (tocheck.length){
                    let result=proposals.Submit(tocheck.shift(),excluded)
                    if (result){
                        return result
                    }
                }
                return null
            })
        }
        Submit(id,excluded){
            id=id||""
            if (!excluded){
                excluded={}
            }
            if (excluded[id]){
                return null
            }
            let p=this.#registered[id]
            if (p==null){
                throw new Error("Proposal "+id+" not found.")
            }
            return p.Submit(this,excluded)
        }
    }
    module.Proposals=Proposals
    return module
})