-- ==============================================================================
-- BiblioTech — Script de Verificação e Comprovação de Operações no Banco MySQL
-- ==============================================================================
-- Utilize estas consultas no MySQL Workbench ou no terminal mysql para gerar
-- as evidências exigidas na avaliação após cada teste do CRUD.

USE bibliotech_db;

-- ------------------------------------------------------------------------------
-- EVIDÊNCIA 1: Visualização do estado inicial da tabela 'livros'
-- ------------------------------------------------------------------------------
SELECT * FROM livros;

-- ------------------------------------------------------------------------------
-- EVIDÊNCIA 2: Comprovação após a operação CREATE (POST /livros)
-- Confirma que o novo livro foi inserido com o ID gerado automaticamente.
-- ------------------------------------------------------------------------------
SELECT id, titulo, autor, isbn, genero, exemplares
FROM livros
ORDER BY id DESC
LIMIT 5;

-- ------------------------------------------------------------------------------
-- EVIDÊNCIA 3: Comprovação após a operação READ (SELECT por ID)
-- Confirma a correspondência entre a resposta do endpoint GET /livros/{id} e o banco.
-- ------------------------------------------------------------------------------
SELECT * FROM livros WHERE id = 1;

-- ------------------------------------------------------------------------------
-- EVIDÊNCIA 4: Comprovação após a operação UPDATE (PUT /livros/{id})
-- Confirma que os dados foram alterados no registro correspondente sem criar novo ID.
-- ------------------------------------------------------------------------------
SELECT id, titulo, autor, isbn, genero, exemplares
FROM livros
WHERE id = 1;

-- ------------------------------------------------------------------------------
-- EVIDÊNCIA 5: Comprovação após a operação DELETE (DELETE /livros/{id})
-- Confirma que o registro com o ID excluído não existe mais na tabela.
-- ------------------------------------------------------------------------------
SELECT * FROM livros WHERE id = 1; -- Deve retornar 0 linhas (Empty set)

-- Contagem total de livros restantes
SELECT COUNT(*) AS total_livros_no_acervo FROM livros;
