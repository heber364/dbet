// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Definição das structs
struct Bet {
    uint256 amount;
    string choice;
    string status;
}

struct Match {
    string team1;
    string team2;
    uint256 matchDate;
    bool isSettled;
    string result;
}

contract BetContract {
    // Informações da partida
    Match public currentMatch;

    // Mapeamento para armazenar as apostas de cada usuário
    mapping(address => Bet[]) public bets;

    // Lista de apostadores
    address[] public bettors;

    // Taxa da plataforma (dinâmica)
    uint256 public platformFeePercent;
    address public owner;

    // Eventos
    event BetPlaced(address indexed better, uint256 amount, string choice);
    event BetSettled(string result);
    event RewardDistributed(address indexed better, uint256 amount);
    event PlatformFeeCollected(uint256 amount);

    // Construtor do contrato
    constructor(
        uint256 _platformFeePercent,
        string memory _team1,
        string memory _team2,
        uint256 _matchDate
    ) {
        require(
            _platformFeePercent <= 100,
            "Fee percent cannot be greater than 100"
        );
        platformFeePercent = _platformFeePercent;
        currentMatch.team1 = _team1;
        currentMatch.team2 = _team2;
        currentMatch.matchDate = _matchDate;
        currentMatch.isSettled = false;
        owner = msg.sender; // Define o criador do contrato como owner
    }

    // Função auxiliar para comparar strings
    function stringsEqual(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    // Modifiers
    modifier bettingOpen() {
        require(!currentMatch.isSettled, "Betting is closed");
        _;
    }

    modifier validBetAmount() {
        require(msg.value > 0, "Bet amount must be greater than 0");
        _;
    }

    modifier validChoice(string memory _choice) {
        require(
            stringsEqual(_choice, currentMatch.team1) ||
                stringsEqual(_choice, currentMatch.team2) ||
                stringsEqual(_choice, "Draw"),
            "Invalid choice"
        );
        _;
    }

    modifier validResult(string memory _result) {
        require(
            stringsEqual(_result, currentMatch.team1) ||
                stringsEqual(_result, currentMatch.team2) ||
                stringsEqual(_result, "Draw"),
            "Invalid result"
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier oneBetPerUser() {
        require(bets[msg.sender].length == 0, "Only one bet per user allowed");
        _;
    }

    // Função para apostar em um time
    function placeBet(
        string memory _choice
    )
        public
        payable
        bettingOpen
        validBetAmount
        validChoice(_choice)
        oneBetPerUser
    {
        // Adiciona a nova aposta ao array do apostador
        bets[msg.sender].push(
            Bet({amount: msg.value, choice: _choice, status: "pending"})
        );

        // Adiciona o apostador à lista de apostadores, se ainda não estiver lá
        if (bets[msg.sender].length == 1) {
            bettors.push(msg.sender);
        }

        emit BetPlaced(msg.sender, msg.value, _choice);
    }

    function settleBet(
        string memory _result
    ) public onlyOwner bettingOpen validResult(_result) {
        currentMatch.isSettled = true;
        currentMatch.result = _result;

        // 1. Calcular o total apostado
        uint256 totalBets = address(this).balance;

        // 2. Calcular a taxa da plataforma com base no total apostado
        uint256 platformFee = (totalBets * platformFeePercent) / 100;
        uint256 remainingPool = totalBets - platformFee;

        // 3. Enviar a taxa da plataforma para o owner
        payable(owner).transfer(platformFee);
        emit PlatformFeeCollected(platformFee);

        // 4. Calcular o total apostado no resultado vencedor
        uint256 totalWinningBets = 0;
        for (uint256 i = 0; i < bettors.length; i++) {
            address bettorAddress = bettors[i];
            for (uint256 j = 0; j < bets[bettorAddress].length; j++) {
                if (stringsEqual(bets[bettorAddress][j].choice, _result)) {
                    totalWinningBets += bets[bettorAddress][j].amount;
                }
            }
        }

        // 5. Calcular e distribuir as recompensas
        for (uint256 i = 0; i < bettors.length; i++) {
            address bettorAddress = bettors[i];
            uint256 totalReward = 0;

            // Calcular a recompensa total do apostador
            for (uint256 j = 0; j < bets[bettorAddress].length; j++) {
                Bet storage bet = bets[bettorAddress][j];

                if (stringsEqual(bet.choice, _result)) {
                    uint256 reward = (bet.amount * remainingPool) /
                        totalWinningBets;
                    totalReward += reward;
                    bet.status = "Won";
                } else {
                    bet.status = "Lost";
                }
            }

            // Transferir a recompensa, se houver
            if (totalReward > 0) {
                payable(bettorAddress).transfer(totalReward);
                emit RewardDistributed(bettorAddress, totalReward);
            }
        }

        // Emite um evento para registrar o resultado da partida
        emit BetSettled(_result);
    }

    // Função para consultar o total apostado em cada time e no empate
    function getTotalBetsByChoice()
        public
        view
        returns (uint256 totalTeam1, uint256 totalTeam2, uint256 totalDraw)
    {
        for (uint256 i = 0; i < bettors.length; i++) {
            address bettorAddress = bettors[i];
            for (uint256 j = 0; j < bets[bettorAddress].length; j++) {
                if (
                    stringsEqual(
                        bets[bettorAddress][j].choice,
                        currentMatch.team1
                    )
                ) {
                    totalTeam1 += bets[bettorAddress][j].amount;
                } else if (
                    stringsEqual(
                        bets[bettorAddress][j].choice,
                        currentMatch.team2
                    )
                ) {
                    totalTeam2 += bets[bettorAddress][j].amount;
                } else if (
                    stringsEqual(bets[bettorAddress][j].choice, "Draw")
                ) {
                    totalDraw += bets[bettorAddress][j].amount;
                }
            }
        }
    }

    function isMatchSettled() public view returns (bool) {
        return currentMatch.isSettled;
    }

    // Função para consultar o total apostado
    function getTotalBets() public view returns (uint256) {
        return address(this).balance;
    }

    function getMyBets() public view returns (Bet memory) {
        return bets[msg.sender][0];
    }

    function getMatchDetails()
        public
        view
        returns (string memory, string memory, uint256, bool, string memory)
    {
        return (
            currentMatch.team1,
            currentMatch.team2,
            currentMatch.matchDate,
            currentMatch.isSettled,
            currentMatch.result
        );
    }
}
