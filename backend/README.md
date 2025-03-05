# Documentação BetFactory & BetContract

## Visão Geral
Esta documentação abrange dois contratos inteligentes Solidity:
- **BetFactory**: Um contrato-fábrica que cria e rastreia contratos de apostas.
- **BetContract**: Um contrato que gerencia apostas em uma partida específica, permitindo que os usuários façam apostas e resolvam os resultados.

## BetFactory (Contrato Fábrica)

### Funcionalidades
- Cria novos contratos de apostas.
- Armazena os endereços de todos os contratos de apostas criados.
- Emite um evento quando um novo contrato de apostas é criado.

### Funções
#### `createBet(string memory _team1, string memory _team2, uint256 _matchDate) public`
Cria um novo `BetContract` para uma partida entre `_team1` e `_team2` na data `_matchDate`.

#### `getBets() public view returns (address[] memory)`
Retorna a lista de todos os endereços de contratos de apostas criados.

---
## BetContract (Contrato de Apostas)

### Funcionalidades
- Permite que os usuários façam apostas em uma partida.
- Armazena as informações das apostas e dos apostadores.
- Calcula e distribui recompensas com base nos resultados das partidas.
- Implementa uma taxa dinâmica da plataforma.

### Estruturas de Dados
#### `Bet`
- `amount`: Valor apostado (em wei).
- `choice`: Time escolhido ou "Empate".

#### `Match`
- `team1`: Nome do time 1.
- `team2`: Nome do time 2.
- `matchDate`: Timestamp da partida.
- `isSettled`: Indica se o resultado da partida foi resolvido.
- `result`: Time vencedor ou "Empate".

### Funções
#### `placeBet(string memory _choice) public payable`
Faz uma aposta em `_choice` (pode ser `team1`, `team2` ou "Empate"). O valor deve ser maior que zero.

#### `settleBet(string memory _result) public`
- Somente o dono do contrato pode chamar.
- Resolve o resultado da partida e distribui os prêmios.
- Deduz a taxa da plataforma antes da distribuição dos ganhos.

#### `getTotalBetsByChoice() public view returns (uint256 totalTeam1, uint256 totalTeam2, uint256 totalDraw)`
Retorna o total de apostas feitas em cada possível resultado.

#### `getTotalBets() public view returns (uint256)`
Retorna o total de fundos no contrato.

#### `isMatchSettled() public view returns (bool)`
Retorna se a partida já foi resolvida.

### Eventos
- `BetPlaced(address indexed better, uint256 amount, string choice)`: Acionado quando uma aposta é feita.
- `BetSettled(string result)`: Acionado quando a partida é resolvida.
- `RewardDistributed(address indexed better, uint256 amount)`: Acionado quando os ganhos são distribuídos.
- `PlatformFeeCollected(uint256 amount)`: Acionado quando a taxa da plataforma é coletada.

---
## Guia de Uso
1. **Implantar `BetFactory`.**
2. **Usar `createBet` para criar um novo `BetContract`.**
3. **Usuários fazem apostas através da função `placeBet` no `BetContract`.**
4. **Após a partida, chamar `settleBet` para distribuir os ganhos.**
5. **Consultar estatísticas de apostas usando `getTotalBetsByChoice` e `getTotalBets`.**

---
## Considerações de Segurança
- O contrato usa verificações `require` para evitar apostas e resoluções inválidas.
- O modificador `onlyOwner` restringe operações sensíveis.
- O contrato impede apostas após a resolução para manter a equidade.

---
## API para o Frontend
Esta seção apresenta os endpoints e métodos para integração do frontend com os contratos.

### Obter Lista de Apostas Criadas
```javascript
const bets = await betFactoryContract.methods.getBets().call();
```

### Criar um Novo Contrato de Apostas
```javascript
await betFactoryContract.methods.createBet("Time A", "Time B", timestamp).send({ from: userAddress });
```

### Fazer uma Aposta
```javascript
await betContract.methods.placeBet("Time A").send({ from: userAddress, value: web3.utils.toWei("0.1", "ether") });
```

### Resolver uma Aposta (Somente Dono do Contrato)
```javascript
await betContract.methods.settleBet("Time A").send({ from: ownerAddress });
```

### Obter Total de Apostas por Opção
```javascript
const [team1Bets, team2Bets, drawBets] = await betContract.methods.getTotalBetsByChoice().call();
```

### Verificar se a Partida foi Resolvida
```javascript
const isSettled = await betContract.methods.isMatchSettled().call();
```

---
## Licença
Este projeto está licenciado sob a Licença MIT.

