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

function link() {
    const web3 = new Web3(window.ethereum);

    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask已經安裝');
    }

    // 請求使用者連接MetaMask
    ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
            // 使用者已連接MetaMask
            console.log('已連接MetaMask');
        })
        .catch(error => {
            // 使用者拒絕連接MetaMask
            Swal.fire('連線錯誤!', '你必須與網頁連線才能正常使用!', 'error');
            console.log('拒絕連接MetaMask');
        });



}


async function getData() {
    document.getElementById('goalAmount').textContent = "載入中..";
    document.getElementById('totalAmount').textContent = "載入中..";
    document.getElementById('numInvestors').textContent = "載入中..";
    document.getElementById('status').textContent = "載入中..";
    contractAddress = await document.getElementById("user-address").value;

    //provider = new Web3.providers.HttpProvider('http://localhost:7545');




    const web3 = new Web3(window.ethereum);

    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask已經安裝');
    }

    // 請求使用者連接MetaMask
    ethereum.request({ method: 'eth_requestAccounts' })
        .then(accounts => {
            // 使用者已連接MetaMask
            console.log('已連接MetaMask');
        })
        .catch(error => {
            // 使用者拒絕連接MetaMask
            Swal.fire('連線錯誤!', '你必須與網頁連線才能正常使用!', 'error');
            console.log('拒絕連接MetaMask');
        });





    // 建立 Web3 實例
    //web3 = await new Web3(provider);

    // 驗證合約地址的有效性
    if (!web3.utils.isAddress(contractAddress)) {

        Swal.fire('Opps!', '無效的合約地址!!', 'error')
        return;
    }
    // 建立合約實例
    //contract = await new web3.eth.Contract(contractABI, contractAddress);
    contract = await new web3.eth.Contract(contractABI, contractAddress, { from: ethereum.selectedAddress });

    updateContractInfo();
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
    if (status == "Funding") {
        status = "募款中.."
    } else if (status == "Campaign Succeeded") {
        status = "募款成功"
    } else if (status == "Campaign Failed") {
        status = "募款失敗"
    }

    // 更新網頁上的資訊
    document.getElementById('goalAmount').textContent = goalAmount.toString();
    document.getElementById('totalAmount').textContent = (totalAmount / 1000000000000000000).toString();
    document.getElementById('numInvestors').textContent = numInvestors.toString();
    document.getElementById('status').textContent = status;
    // document.getElementById('deadline').textContent = new Date(deadline * 1000).toLocaleString();
    countdownTimer(deadline, elementId);
}

function countdownTimer(deadline, elementId) {
    // 取得目標元素
    var element = document.getElementById(elementId);

    function updateTimer() {
        // 取得現在時間和截止時間的毫秒數
        var currentTime = new Date().getTime();
        var targetTime = new Date(deadline * 1000).getTime();

        // 計算剩餘時間（毫秒）
        remainingTime = targetTime - currentTime;

        // 計算剩餘天、小時、分鐘和秒數
        var days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        var hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        // 更新元素內容為倒數計時器
        if (contractAddress != "") {
            element.textContent = days + "天 " + hours + "小時 " + minutes + "分鐘 " + seconds + "秒";
        } else {
            element.textContent = "等待輸入中..."
        }


        // 若還有剩餘時間，每秒更新一次
        if (remainingTime > 0) {
            setTimeout(updateTimer, 1000);
        } else if (contractAddress != "") {
            element.textContent = "募款活動已結束!"
        }
    }

    // 呼叫函式開始倒數計時
    updateTimer();
}

// 呼叫函式並指定截止時間和要更新的元素 ID
var elementId = "deadline";
countdownTimer(deadline, elementId);


async function fund() {
    var status = await contract.methods.status().call();
    const investmentAmount = document.getElementById('investmentAmount').value;
    if (investmentAmount <= 0 && status == "Funding") {
        Swal.fire('Opps!', '投資金額必須大於零!!', 'error')
        return;
    } else if (status !== "Funding") {
        Swal.fire('Opps!', '投資活動已結束!!', 'error')
        return;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const weiAmount = investmentAmount * 10 ** 18;
        await contract.methods.fund().send({ from: accounts[0], value: weiAmount, gas: '5000000' });
        Swal.fire('Good!', '投資成功!!', 'success')
        updateContractInfo();
    } catch (error) {
        console.error(error);
        if (status !== "Funding") {
            Swal.fire('Opps!', '投資活動已結束!!', 'error')
        } else {
            Swal.fire('Opps!', '投資失敗!!', 'error')
        }
    }
}


async function checkGoalReached() {
    var status = await contract.methods.status().call();
    if (status !== "Funding") {
        Swal.fire('Opps!', '投資活動已結束!!', 'error')
        return;
    } else if (remainingTime > 0) {
        Swal.fire('Opps!', '尚未到達截止時間!!', 'error')
        return;
    }
    try {
        const status = await contract.methods.status().call();
        if (status === "Campaign Succeeded") {
            Swal.fire('Good!', '目標金額已達成!!', 'success')
        } else if (status === "Campaign Failed") {
            Swal.fire('Opps!', '目標金額未達成!!', 'error')
        }
        await contract.methods.checkGoalReached().send({ gas: '5000000' });
        updateContractInfo();
    } catch (error) {
        console.error(error);
        if (status != "Funding") {
            Swal.fire('Opps!', '投資活動已結束!!', 'error')
        }

    }
}

