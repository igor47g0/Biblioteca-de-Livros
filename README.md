# BiblioTech — Sistema de Acervo de Biblioteca

> **Avaliação Prática:** Sistema de Acervo de Biblioteca com Back-end Spring Boot (Java 17+), Banco de Dados MySQL e Front-end Web.

---

## 🏛️ Estrutura do Repositório

```text
bibliotech/
├── backend/                       # Aplicação Spring Boot 3.x
│   ├── pom.xml                    # Configuração Maven e dependências oficiais
│   ├── sql/
│   │   └── init.sql               # Script DDL/DML para criação do banco e tabela
│   └── src/
│       ├── main/
│       │   ├── java/com/bibliotech/
│       │   │   ├── BibliotechApplication.java
│       │   │   ├── config/
│       │   │   │   └── CorsConfig.java               # Configuração global de CORS
│       │   │   ├── controller/
│       │   │   │   └── LivroController.java          # Endpoints REST (201, 200, 204)
│       │   │   ├── dto/
│       │   │   │   ├── LivroRequestDTO.java          # Validações Bean Validation
│       │   │   │   ├── LivroResponseDTO.java
│       │   │   │   ├── ErrorResponseDTO.java
│       │   │   │   └── ValidationErrorDTO.java
│       │   │   ├── exception/
│       │   │   │   ├── ResourceNotFoundException.java # Mapeado para 404
│       │   │   │   ├── DuplicateIsbnException.java    # Mapeado para 409
│       │   │   │   └── GlobalExceptionHandler.java    # Centralizador de erros
│       │   │   ├── model/
│       │   │   │   └── Livro.java                    # Entidade JPA (Jakarta)
│       │   │   ├── repository/
│       │   │   │   └── LivroRepository.java          # Spring Data JPA seguro
│       │   │   └── service/
│       │   │       └── LivroService.java             # Regras de negócio isoladas
│       │   └── resources/
│       │       └── application.properties            # Conexão MySQL
│       └── test/java/com/bibliotech/                 # Testes unitários e de integração
│           ├── controller/LivroControllerTest.java   # MockMvc (400, 404, 409, 201, etc.)
│           └── service/LivroServiceTest.java
│
├── frontend/                      # Interface Web moderna e responsiva
│   ├── index.html                 # Layout semântico, modais de CRUD e feedback
│   ├── css/
│   │   └── styles.css             # Estilização limpa, badges e estados visuais
│   └── js/
│       └── app.js                 # Consumo da API via fetch com tratamento de erros
│
├── evidencias/                    # Pasta de comprovação e testes
│   ├── postman/
│   │   └── bibliotech.postman_collection.json # Coleção pronta para importar no Postman
│   ├── mysql/
│   │   └── consultas_evidencias.sql           # Queries de verificação pós-operações
│   ├── GUIA_DE_EVIDENCIAS.md                  # Roteiro passo a passo com checklist de prints
│   └── relatorio_evidencias.html              # Relatório visual exportável para PDF
│
├── RESPOSTAS.txt                  # Respostas analíticas às 3 perguntas e prompts de IA
└── README.md                      # Documentação técnica do projeto
```

---

## 📋 Contrato da API REST

| Operação | Verbo HTTP | Endpoint | Operação no Banco | Status de Sucesso | Status de Erro Possíveis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cadastrar (Create)** | `POST` | `/livros` | `INSERT` | `201 Created` | `400 Bad Request`, `409 Conflict` |
| **Listar (Read)** | `GET` | `/livros` | `SELECT *` | `200 OK` | `500 Internal Error` |
| **Buscar por ID (Read)**| `GET` | `/livros/{id}` | `SELECT WHERE id` | `200 OK` | `404 Not Found` |
| **Atualizar (Update)** | `PUT` | `/livros/{id}` | `UPDATE` | `200 OK` | `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| **Excluir (Delete)** | `DELETE` | `/livros/{id}` | `DELETE` | `204 No Content` | `404 Not Found` |

### Exemplos de Payload

#### Requisição: `POST /livros` / `PUT /livros/{id}`
```json
{
  "titulo": "Clean Code: Habilidades Práticas do Agile Software",
  "autor": "Robert C. Martin",
  "isbn": "9780132350884",
  "genero": "Engenharia de Software",
  "exemplares": 10
}
```

#### Resposta de Erro: `400 Bad Request`
```json
{
  "timestamp": "2026-11-09 19:30:00",
  "status": 400,
  "erro": "Dados de Requisição Inválidos",
  "mensagem": "O título deve possuir entre 3 e 150 caracteres.",
  "path": "/livros",
  "validacoes": [
    { "campo": "titulo", "mensagem": "O título deve possuir entre 3 e 150 caracteres." },
    { "campo": "exemplares", "mensagem": "O número de exemplares deve ser um número inteiro maior ou igual a 0." }
  ]
}
```

#### Resposta de Erro: `409 Conflict` (ISBN Duplicado)
```json
{
  "timestamp": "2026-11-09 19:30:00",
  "status": 409,
  "erro": "Conflito de Dados (ISBN Duplicado)",
  "mensagem": "Já existe um livro cadastrado com o ISBN informado: 9780132350884",
  "path": "/livros"
}
```

#### Resposta de Erro: `404 Not Found` (ID Inexistente)
```json
{
  "timestamp": "2026-11-09 19:30:00",
  "status": 404,
  "erro": "Recurso Não Encontrado",
  "mensagem": "Livro não encontrado com o ID: 9999",
  "path": "/livros/9999"
}
```

---

## 🚀 Como Executar o Projeto

### 1. Banco de Dados MySQL
1. Inicie seu serviço MySQL (porta `3306`).
2. Crie a base de dados:
   ```sql
   CREATE DATABASE IF NOT EXISTS bibliotech_db CHARACTER SET utf8mb4;
   ```
3. O Spring Boot com `ddl-auto=update` criará a tabela `livros` automaticamente, ou você pode rodar o arquivo `backend/sql/init.sql`.
4. Ajuste seu usuário/senha em `backend/src/main/resources/application.properties`.

### 2. Back-end (Spring Boot 3.x)
- Abra o diretório `backend` no IntelliJ IDEA / VS Code e execute a classe `BibliotechApplication.java`.
- Ou execute pelo terminal:
  ```bash
  cd backend
  mvn clean spring-boot:run
  ```

### 3. Front-end
- Abra o arquivo `frontend/index.html` em qualquer navegador moderno.
- Não requer instalação de pacotes (`node_modules`), pois foi desenvolvido em Vanilla HTML5/CSS3/JavaScript ES6+, funcionando diretamente e consumindo a API com suporte a CORS.

---

## 🧪 Testes e Evidências

1. **Postman:** Importe o arquivo `evidencias/postman/bibliotech.postman_collection.json` para testar todos os cenários (sucesso e erros 400, 404, 409).
2. **MySQL:** Execute as consultas em `evidencias/mysql/consultas_evidencias.sql` para comprovar cada operação de escrita.
3. **Guia e Relatório:** Consulte `evidencias/GUIA_DE_EVIDENCIAS.md` e abra `evidencias/relatorio_evidencias.html`.

---

## 📝 Arquivo de Reflexão e Prompts

As respostas para as 3 perguntas de reflexão crítica e o registro detalhado dos prompts de IA utilizados encontram-se no arquivo **`RESPOSTAS.txt`** na raiz do projeto.
