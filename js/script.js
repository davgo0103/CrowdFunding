// 請修改以下的 ABI
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_duration",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_goalAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "checkGoalReached",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deadline",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ended",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fund",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "goalAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "investors",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "addr",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "numInvestors",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "status",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];


// 請修改以下合約位址
async function getData() {
    contractAddress = await document.getElementById("user-address").value;
    // 請修改以下的提供者位址
    provider = new Web3.providers.HttpProvider('http://localhost:7545');

    // 建立 Web3 實例
    web3 = await new Web3(provider);
    // 建立合約實例
    contract = await new web3.eth.Contract(contractABI, contractAddress);
    updateContractInfo()
}







// 更新合約資訊的函數
async function updateContractInfo() {
    // 使用 web3 提供的方法獲取合約資訊
    const goalAmount = await contract.methods.goalAmount().call();
    const totalAmount = await contract.methods.totalAmount().call();
    const ended = await contract.methods.ended().call();
    const numInvestors = await contract.methods.numInvestors().call();
    var status = await contract.methods.status().call();
    const deadline = await contract.methods.deadline().call();
    if(status == "Funding"){
        status = "募款中.."
    }else if(status == "Campaign Succeeded"){
        status = "募款成功"
    }else if(status == "Campaign Failed"){
        status = "募款失敗"
    }

    // 更新網頁上的資訊
    document.getElementById('goalAmount').textContent = goalAmount.toString();
    document.getElementById('totalAmount').textContent = (totalAmount / 1000000000000000000).toString();
    document.getElementById('numInvestors').textContent = numInvestors.toString();
    document.getElementById('status').textContent = status;
    document.getElementById('deadline').textContent = new Date(deadline * 1000).toLocaleString();
}


async function fund() {
    const investmentAmount = document.getElementById('investmentAmount').value;
    if (investmentAmount <= 0) {
        alert('投資金額必須大於零');
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        const overrides = {
            value: web3.utils.toWei(investmentAmount, 'ether')
        };
        await contract.methods.fund().send({ from: accounts[0], ...overrides, gas: '5000000' });
        alert('投資成功！');
        updateContractInfo();
    } catch (error) {
        console.error(error);
        if (status != "Funding") {
            alert('投資活動已結束！');
        }
        else {
            alert('投資失敗！');
        }
    }
}

async function checkGoalReached() {
    try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.checkGoalReached().send({ from: accounts[0], gas: '5000000' });
        const status = await contract.methods.status().call();
        if (status === "Campaign Succeeded") {
            alert('目標金額已達成！');
        } else if (status === "Campaign Failed") {
            alert('目標金額未達成！');
        }
        updateContractInfo();
    } catch (error) {
        console.error(error);
        if (status != "Funding") {
            alert('投資活動已結束！');
        }
        else {
            alert('尚未到達截止時間！');
        }

    }
}

