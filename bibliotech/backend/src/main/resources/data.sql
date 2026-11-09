-- Carga inicial de livros (executada na inicialização da aplicação)
MERGE INTO livros (id, titulo, autor, isbn, genero, exemplares) KEY(id) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '9780132350884', 'Engenharia de Software', 5),
(2, 'O Programador Pragmático', 'Andrew Hunt e David Thomas', '9788577807000', 'Engenharia de Software', 3),
(3, 'Domain-Driven Design: Atacando as Complexidades no Coração do Software', 'Eric Evans', '9788550800653', 'Arquitetura de Software', 2);
