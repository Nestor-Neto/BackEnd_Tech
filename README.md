# EricTech Backend

Backend desenvolvido com Node.js, TypeScript, seguindo os princípios da Clean Architecture e Domain-Driven Design.

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- TypeORM
- MongoDB
- Docker
- JWT para autenticação
- Swagger para documentação
- Multer para upload de imagens

## Requisitos

- Node.js 18 ou superior
- Docker e Docker Compose
- MongoDB (opcional, se não usar Docker)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/erictech-backend.git
cd erictech-backend
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
MONGODB_URI=mongodb://localhost:27017/erictech
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

4. Execute com Docker:
```bash
docker-compose up
```

Ou execute localmente:
```bash
npm run start
```

## Documentação da API

A documentação da API está disponível através do Swagger UI em:
```
http://localhost:3000/swagger
```

## Endpoints Principais

### Usuários
- POST /users - Criar usuário
- POST /users/authenticate - Autenticar usuário
- GET /users - Listar usuários
- PUT /users/:id - Atualizar usuário
- DELETE /users/:id - Excluir usuário

### Criptomoedas
- GET /cryptocurrencies - Listar criptomoedas
- GET /cryptocurrencies/:symbol - Obter preço de uma criptomoeda
- POST /cryptocurrencies/update-prices - Atualizar preços

## Estrutura do Projeto

```
src/
├── application/
│   └── controllers/
├── domain/
│   ├── entities/
│   └── repositories/
├── infrastructure/
│   ├── database/
│   └── repositories/
└── server.ts
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. 