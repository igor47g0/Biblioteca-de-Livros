# Guia Completo de Testes e Geração de Evidências — BiblioTech

Este documento orienta o passo a passo para a execução do sistema, realização dos testes no **Postman**, verificação no **MySQL** e no **Front-end**, em conformidade rigorosa com a matriz de avaliação.

---

## 1. Como Executar o Sistema

### 1.1. Banco de Dados MySQL
1. Abra o **MySQL Workbench** ou seu terminal MySQL.
2. Certifique-se de que o serviço MySQL está ativo na porta padrão `3306`.
3. Execute o script `backend/sql/init.sql` ou execute:
   ```sql
   CREATE DATABASE IF NOT EXISTS bibliotech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Verifique as credenciais no arquivo `backend/src/main/resources/application.properties`:
   - `spring.datasource.username=root`
   - `spring.datasource.password=root` (ou a senha configurada na sua máquina).

### 1.2. Back-end Spring Boot
- **Pelo IntelliJ IDEA / VS Code / Eclipse:**
  - Abra a pasta `backend/` como projeto Maven.
  - Execute a classe principal: `com.bibliotech.BibliotechApplication`.
- **Ou via Linha de Comando (Maven):**
  ```bash
  cd backend
  mvn clean spring-boot:run
  ```
- O servidor iniciará na porta `8080` (`http://localhost:8080/livros`).

### 1.3. Front-end
- Abra o arquivo `frontend/index.html` diretamente em seu navegador (Google Chrome, Firefox, Edge) com dois cliques, ou utilizando a extensão **Live Server** no VS Code.

---

## 2. Roteiro de Prints e Evidências Exigidas

A avaliação requer a comprovação de cada operação do CRUD no Postman, no MySQL e no Front-end.

---

### EVIDÊNCIA 1: Operação CREATE (POST /livros) — Status 201 Created

#### A. Postman:
- **Método & URL:** `POST http://localhost:8080/livros`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "titulo": "Arquitetura Limpa",
    "autor": "Robert C. Martin",
    "isbn": "9788550804606",
    "genero": "Engenharia de Software",
    "exemplares": 8
  }
  ```
- **Resposta esperada:** Status `201 Created`, cabeçalho `Location` apontando para o recurso criado, e o JSON retornado com o `id` preenchido.
- 📸 **Print a tirar:** Janela do Postman com o status `201 Created` e o JSON de retorno.

#### B. MySQL Workbench:
- Execute a query:
  ```sql
  USE bibliotech_db;
  SELECT * FROM livros ORDER BY id DESC LIMIT 1;
  ```
- 📸 **Print a tirar:** Grid de resultados do MySQL mostrando a nova linha inserida com os valores correspondentes.

#### C. Front-end:
- Clique no botão `➕ Cadastrar Novo Livro`.
- Preencha os campos com os dados acima e clique em `Salvar Livro`.
- 📸 **Print a tirar:** Tela exibindo a notificação de sucesso verde `Sucesso (201 Created)` e a nova linha exibida na tabela.

---

### EVIDÊNCIA 2: Operação READ (GET /livros) — Status 200 OK

#### A. Postman:
- **Método & URL:** `GET http://localhost:8080/livros`
- **Resposta esperada:** Status `200 OK` com array JSON contendo todos os livros.
- 📸 **Print a tirar:** Janela do Postman com status `200 OK` e a lista JSON.

#### B. MySQL:
- Execute a query:
  ```sql
  SELECT id, titulo, autor, isbn, genero, exemplares FROM livros;
  ```
- 📸 **Print a tirar:** Grid do MySQL comprovando os mesmos registros listados.

#### C. Front-end:
- 📸 **Print a tirar:** Tabela do BiblioTech exibindo a listagem completa com IDs, títulos, autores, badges de gênero e contagem de exemplares.

---

### EVIDÊNCIA 3: Operação UPDATE (PUT /livros/{id}) — Status 200 OK

#### A. Postman:
- **Método & URL:** `PUT http://localhost:8080/livros/1`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "titulo": "Clean Code - Edição Revisada",
    "autor": "Robert C. Martin",
    "isbn": "9780132350884",
    "genero": "Engenharia de Software",
    "exemplares": 15
  }
  ```
- **Resposta esperada:** Status `200 OK` com o JSON contendo os dados atualizados.
- 📸 **Print a tirar:** Janela do Postman com status `200 OK` e o JSON atualizado.

#### B. MySQL:
- Execute a query:
  ```sql
  SELECT * FROM livros WHERE id = 1;
  ```
- 📸 **Print a tirar:** Grid do MySQL comprovando a alteração dos valores no registro de ID 1 (sem criar outro ID).

#### C. Front-end:
- Na linha do livro de ID 1, clique no botão `✏️ Editar`.
- Altere o campo "Quantidade de Exemplares" ou "Título" e clique em `Atualizar Alterações`.
- 📸 **Print a tirar:** Notificação de sucesso `Sucesso (200 OK)` e a linha com os dados atualizados.

---

### EVIDÊNCIA 4: Operação DELETE (DELETE /livros/{id}) — Status 204 No Content

#### A. Postman:
- **Método & URL:** `DELETE http://localhost:8080/livros/1`
- **Resposta esperada:** Status `204 No Content` com corpo de resposta vazio.
- 📸 **Print a tirar:** Janela do Postman com status `204 No Content`.

#### B. MySQL:
- Execute a query:
  ```sql
  SELECT * FROM livros WHERE id = 1;
  ```
- 📸 **Print a tirar:** Grid do MySQL retornando `0 rows returned` (Empty set), comprovando a remoção física.

#### C. Front-end:
- Clique no botão `🗑️ Excluir` de um livro de teste.
- 📸 **Print a tirar 1:** Modal de confirmação aberto perguntando "Tem certeza de que deseja remover este livro do acervo?".
- Clique em `Sim, Excluir`.
- 📸 **Print a tirar 2:** Notificação de sucesso `Sucesso (204 No Content)` e a linha removida da tabela.

---

### EVIDÊNCIA 5: Validação de Entrada e Tratamento de Erros (400, 404 e 409)

#### A. Erro 400 Bad Request (Dados Inválidos):
- **No Postman:** Envie um POST com `"titulo": "Oi"` e `"exemplares": -1`.
- **Resultado:** Status `400 Bad Request` com array `validacoes`.
- **No Front-end:** Tente salvar o formulário com título com 2 caracteres ou exemplares negativos.
- 📸 **Print a tirar:** Campos destacados em vermelho no modal e alerta com a lista de erros de validação retornados pela API.

#### B. Erro 409 Conflict (ISBN Duplicado):
- **No Postman:** Tente cadastrar um novo livro utilizando um ISBN que já existe no banco.
- **Resultado:** Status `409 Conflict` com mensagem `Já existe um livro cadastrado com o ISBN informado`.
- **No Front-end:** Tente cadastrar livro com ISBN duplicado.
- 📸 **Print a tirar:** Campo ISBN destacado com mensagem de erro `Erro 409 Conflict: ISBN duplicado detectado`.

#### C. Erro 404 Not Found (ID Inexistente):
- **No Postman:** Faça um `GET http://localhost:8080/livros/9999` ou `DELETE http://localhost:8080/livros/9999`.
- **Resultado:** Status `404 Not Found` com mensagem `Livro não encontrado com o ID: 9999`.
- 📸 **Print a tirar:** Postman exibindo o status 404 e mensagem explicativa.

---

## 3. Checklist de Entrega

- [x] Repositório organizado com as pastas `backend/` e `frontend/`.
- [x] Pasta `backend/` contendo código em camadas (`controller`, `service`, `repository`, `model`, `dto`, `exception`, `config`).
- [x] JPA configurado com `jakarta.persistence.*` (Spring Boot 3.x).
- [x] Cinco endpoints implementados com os devidos códigos HTTP (201, 200, 204, 400, 404, 409).
- [x] Regras de negócio isoladas no `LivroService`.
- [x] Front-end funcional com listagem, cadastro, edição, confirmação de exclusão e exibição das mensagens de erro da API.
- [x] CORS habilitado no back-end.
- [x] Arquivo `RESPOSTAS.txt` preenchido com as 3 reflexões críticas e o registro dos prompts de IA.
- [x] Pasta `evidencias/` com coleção do Postman, scripts SQL e prints capturados.
