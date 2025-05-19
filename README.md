# 🚀 EricTech Backend

Backend desenvolvido com Node.js, TypeScript, seguindo os princípios da Clean Architecture e Domain-Driven Design.

## 🛠️ Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- TypeORM
- MongoDB
- Docker
- JWT para autenticação
- Swagger para documentação
- Multer para upload de imagens
- Jest para testes
- Supertest para testes de integração

## 🏗️ Arquitetura e Padrões

### Clean Architecture
O projeto segue os princípios da Clean Architecture, dividindo o código em camadas:
- **Domain**: Contém as entidades e regras de negócio
- **Application**: Casos de uso e lógica de aplicação
- **Infrastructure**: Implementações concretas (banco de dados, frameworks, etc.)
- **Presentation**: Controllers e rotas

### Domain-Driven Design (DDD)
- Entidades e Value Objects
- Agregados
- Repositórios
- Serviços de Domínio
- Eventos de Domínio

## 📋 Requisitos

- Node.js 18 ou superior
- Docker e Docker Compose
- MongoDB (opcional, se não usar Docker)
- Git

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Nestor-Neto/BackEnd_Tech.git
cd BackEnd_Tech
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.0
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

## 🚀 Executando o Projeto

### Usando Docker
```bash
docker-compose up
```

### Execução Local
```bash
npm run start
```

## 🧪 Testes

### Framework de Teste
- Jest como framework principal
- Supertest para testes de integração
- Coverage reports com Jest

### Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes de integração
npm run test:integration

# Executar testes unitários
npm run test:unit
```

### Tipos de Testes

#### Testes Unitários
- Testes de entidades
- Testes de serviços
- Testes de repositórios
- Testes de casos de uso

#### Testes de Integração
- Testes de API
- Testes de banco de dados
- Testes de autenticação

#### Testes Funcionais
- Testes de fluxos completos
- Testes de regras de negócio
- Testes de validações

## 📚 Documentação da API

A documentação da API está disponível através do Swagger UI em:
```
http://localhost:3000/swagger
```

## 🔌 Endpoints Principais

### 👤 Usuários (`UserController`)
- **POST** `/api/users`
  - Criação de novo usuário
  - Body: `{ name: string, email: string, password: string, description?: string, imageBase64?: string }`
  - Status: 201 (Created), 400 (Bad Request), 500 (Internal Server Error)

- **POST** `/api/users/authenticate`
  - Autenticação de usuário
  - Body: `{ email: string, password: string }`
  - Retorna token JWT e dados do usuário
  - Status: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 500 (Internal Server Error)

- **GET** `/api/users`
  - Lista todos os usuários
  - Status: 200 (OK), 500 (Internal Server Error)

- **PUT** `/api/users/:id`
  - Atualiza dados do usuário
  - Body: `{ id: string, name?: string, description?: string, imageBase64?: string }`
  - Status: 200 (OK), 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error)

- **DELETE** `/api/users/:id`
  - Remove um usuário
  - Status: 204 (No Content), 404 (Not Found), 500 (Internal Server Error)

### 💰 Criptomoedas (`CryptocurrencyController`)
- **GET** `/api/cryptocurrencies`
  - Lista todas as criptomoedas disponíveis
  - Status: 200 (OK), 500 (Internal Server Error)

- **GET** `/api/cryptocurrencies/name/:name`
  - Busca criptomoeda por nome
  - Parâmetros: `name` (nome da criptomoeda)
  - Status: 200 (OK), 404 (Not Found), 500 (Internal Server Error)

- **GET** `/api/cryptocurrencies/:id`
  - Busca criptomoeda por ID
  - Parâmetros: `id` (ID da criptomoeda)
  - Status: 200 (OK), 404 (Not Found), 500 (Internal Server Error)

## 📁 Estrutura do Projeto

```
src/
├── application/
│   ├── controllers/
│   ├── use-cases/
│   └── dtos/
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   └── value-objects/
├── infrastructure/
│   ├── database/
│   │   └── mongodb/
│   ├── repositories/
│   └── services/
├── presentation/
│   ├── routes/
│   └── middlewares/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── functional/
└── server.ts
```

## 💾 Banco de Dados

### MongoDB
- Banco de dados NoSQL
- Schemas definidos com TypeORM
- Índices otimizados
- Validações de dados
- Transações quando necessário

## 💾 Histórico de verisonamento no Git
```stl
$ git log --oneline --decorate --graph --all
*   ea93b70 (HEAD -> main, origin/main, origin/develop, origin/HEAD, develop) Merge tag '1.2.0' into develop

|\
| *   6492191 (tag: 1.2.0, master) Merge branch 'release/1.2.0'
| |\
| | * 7b7a92b Alteração de versão para 1.2.0
| |/
|/|
* |   b517380 Merge branch 'feature/integracao_Api_externa_criptomoedas' into develop
|\ \
| * | d225e61 anotacoes no package
| * | bfc51af implementacao API das criptos
|/ /
* | bcaa602 implementação dos testes
* | dad9686  versão 1.0.0
|/
* 81c631d Initial commit
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request


## 📄 Licença

Este projeto está sob a licença MIT. 