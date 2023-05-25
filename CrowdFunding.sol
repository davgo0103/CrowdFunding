//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdFunding {
    // 投資家
    struct Investor {
        address payable addr; // 投資家的位址
        uint256 amount; // 投資額
    }
    
    address payable public owner; // 合約所有人
    uint256 public numInvestors; // 投資家數目
    uint256 public deadline; // 截止日期（UnixTime）
    string public status; // 募資活動的狀態
    bool public ended; // 募資活動是否已終了
    uint256 public goalAmount; // 目標額
    uint256 public totalAmount; // 投資總額
    mapping(uint256 => Investor) public investors; // 管理投資家的對應表（map）

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    constructor(uint256 _duration, uint256 _goalAmount) {
        owner = payable(msg.sender);
        // 用block.timestamp設定截止日期
        deadline = block.timestamp + _duration;
        goalAmount = _goalAmount;
        status = "Funding";
        ended = false;
        numInvestors = 0;
        totalAmount = 0;
    }

    /// 投資時會被呼叫的函數
    function fund() public payable {
        // 若是活動已結束的話就中斷處理
        require(!ended, "The crowdfunding has ended");
        Investor storage inv = investors[numInvestors++];
        inv.addr = payable(msg.sender);
        inv.amount = msg.value;
        totalAmount += inv.amount;
    }

    /// 確認是否已達成目標金額
    /// 此外，根據活動的成功於否進行ether的匯款
    function checkGoalReached() public onlyOwner {
        // 若是活動已結束的話就中斷處理
        require(!ended, "The crowdfunding has ended");
        // 截止日期還沒到就中斷處理
        require(block.timestamp >= deadline, "The deadline has not been reached");

        if (totalAmount >= goalAmount) {
            // 活動成功的時候
            status = "Campaign Succeeded";
            ended = true;
            // 將合約內所有以太幣（ether）傳送給所有人
            (bool success, ) = owner.call{value: address(this).balance}("");
            require(success, "Failed to transfer funds to the contract owner");
        } else {
            // 活動失敗的時候
            uint256 i = 0;
            status = "Campaign Failed";
            ended = true;
            // 將ether退款給每位投資家
            while (i < numInvestors) {
                (bool success, ) = investors[i].addr.call{value: investors[i].amount}("");
                require(success, "Failed to refund funds to investors");
                i++;
            }
        }
    }
}
