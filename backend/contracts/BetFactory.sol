// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BetContract.sol";

contract BetFactory {
    // Lista de todos os contratos de apostas criados
    address[] public bets;

    // Evento emitido quando um novo contrato de aposta é criado
    event BetCreated(
        address indexed betAddress,
        string team1,
        string team2,
        uint256 matchDate,
        string owner
    );

    // Função para criar um novo contrato de aposta
    function createBet(
        uint256 _platformFeePercent,
        string memory _team1,
        string memory _team2,
        uint256 _matchDate,
        string memory _owner
    ) public {
        BetContract newBet = new BetContract(
            _platformFeePercent,
            _team1,
            _team2,
            _matchDate,
            _owner
        );
        bets.push(address(newBet));
        emit BetCreated(address(newBet), _team1, _team2, _matchDate, _owner); // Inclui o owner no evento
    }

    // Função para retornar a lista de contratos de apostas
    function getBets() public view returns (address[] memory) {
        return bets;
    }
}