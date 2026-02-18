# Wordle PT-BR

Jogo de palavras inspirado no Wordle, com palavras em Portugues Brasileiro. Adivinhe a palavra de 5 letras em ate 6 tentativas.

## Como jogar

1. Digite uma palavra de 5 letras e pressione **Enter**
2. Cada letra muda de cor indicando o resultado:
   - **Verde**: a letra esta na posicao correta
   - **Amarelo**: a letra existe na palavra, mas em outra posicao
   - **Cinza**: a letra nao existe na palavra
3. Use as dicas para adivinhar a palavra em ate 6 tentativas
4. Uma nova palavra e sorteada a cada dia

## Requisitos

Antes de comecar, certifique-se de ter instalado:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ou [OrbStack](https://orbstack.dev/) (macOS)

Verifique se o Docker esta funcionando:

```bash
docker --version
docker compose version
```

Se ambos os comandos retornarem a versao, voce esta pronto.

## Passo a passo para rodar o projeto

### 1. Clonar o repositorio

```bash
git clone git@github.com:franknfjr/wordle-ptbr.git
cd wordle-ptbr
```

### 2. Criar o arquivo de variaveis de ambiente

O projeto precisa de um arquivo `.env` na raiz do projeto para configurar o banco de dados. Crie o arquivo:

```bash
touch .env
```

Abra o `.env` com seu editor de texto e adicione o seguinte conteudo:

```env
DB_USER=wordle
DB_PASSWORD=wordle123
DB_NAME=wordle
```

| Variavel | Descricao | Valor padrao |
|----------|-----------|--------------|
| `DB_USER` | Usuario do PostgreSQL | wordle |
| `DB_PASSWORD` | Senha do PostgreSQL | wordle123 |
| `DB_NAME` | Nome do banco de dados | wordle |

> **Nota:** Em producao, troque a senha por algo mais seguro. Para desenvolvimento local, os valores acima funcionam perfeitamente.

### 3. Iniciar o Docker

Certifique-se de que o Docker Desktop (ou OrbStack) esta aberto e rodando.

### 4. Subir os containers

```bash
docker compose up --build
```

Esse comando vai:

1. Baixar as imagens do PostgreSQL, Node.js e Nginx
2. Criar o banco de dados e as tabelas automaticamente
3. Popular o banco com 299 palavras em portugues
4. Iniciar a API (Express)
5. Fazer o build do frontend (React) e servir via Nginx

Aguarde ate ver no terminal:

```
wordle-api-1       | Wordle PT-BR API running on port 4000
wordle-frontend-1  | start worker processes
```

### 5. Acessar o jogo

Abra o navegador e acesse:

**http://localhost:3000**

Pronto! O jogo esta rodando.

### 6. Parar o jogo

Para parar todos os containers, pressione `Ctrl + C` no terminal, ou em outro terminal:

```bash
docker compose down
```

Para parar e **apagar todos os dados** do banco (resetar tudo):

```bash
docker compose down -v
```

## Rodar em segundo plano

Se quiser rodar sem ocupar o terminal:

```bash
docker compose up --build -d
```

Para ver os logs:

```bash
docker compose logs -f
```

## Portas utilizadas

| Servico | Porta | URL |
|---------|-------|-----|
| Frontend (Nginx) | 3000 | http://localhost:3000 |
| API (Express) | 4000 | http://localhost:4000 |
| PostgreSQL | 5432 | localhost:5432 |

> Se alguma porta ja estiver em uso, pare o servico que esta usando ou altere as portas no `docker-compose.yml`.

## Arquitetura

```
Navegador (3000) -> Nginx -> /api/* -> Express (4000) -> PostgreSQL (5432)
```

| Servico | Tecnologia | Funcao |
|---------|-----------|--------|
| Frontend | React + Vite + Nginx | Interface do jogo |
| API | Node.js + Express | Logica do jogo e validacao |
| Banco de dados | PostgreSQL 16 | Armazena palavras, jogadores e estatisticas |

## Banco de dados

O PostgreSQL armazena:

- **words** - 299 palavras de 5 letras em portugues
- **daily_words** - palavra do dia (uma por dia, sorteada automaticamente)
- **players** - jogadores identificados por UUID (anonimo, sem cadastro)
- **game_results** - resultados das partidas (vitoria/derrota, tentativas)

Os dados persistem entre restarts gracas ao volume Docker `pgdata`.

## API

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/daily` | Retorna o ID da palavra do dia |
| POST | `/api/guess` | Valida um palpite e retorna o resultado |
| POST | `/api/stats` | Salva o resultado de uma partida |
| GET | `/api/stats/:playerId` | Estatisticas do jogador |
| GET | `/api/leaderboard` | Top 10 jogadores por sequencia de vitorias |
| GET | `/api/health` | Health check da API |

## Resolucao de problemas

**Docker nao esta rodando:**
Abra o Docker Desktop ou OrbStack e espere ele iniciar completamente.

**Porta 3000 ja esta em uso:**
Pare o outro servico ou altere a porta no `docker-compose.yml` (linha `"3000:80"`).

**Erro de conexao com o banco:**
Verifique se o arquivo `.env` existe na raiz do projeto com as variaveis corretas.

**Resetar o jogo completamente:**
```bash
docker compose down -v
docker compose up --build
```
