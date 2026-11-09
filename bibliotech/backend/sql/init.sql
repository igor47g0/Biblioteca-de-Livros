-- Script de Criação do Banco de Dados e Tabela - BiblioTech
-- Compatível com MySQL 5.7 e MySQL 8.0+

CREATE DATABASE IF NOT EXISTS bibliotech_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bibliotech_db;

CREATE TABLE IF NOT EXISTS livros (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NOT NULL UNIQUE,
    genero VARCHAR(255) NOT NULL,
    exemplares INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dados iniciais de teste (opcional)
INSERT INTO livros (titulo, autor, isbn, genero, exemplares) VALUES
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '9780132350884', 'Engenharia de Software', 5),
('O Programador Pragmático', 'Andrew Hunt e David Thomas', '9788577807000', 'Engenharia de Software', 3),
('Domain-Driven Design', 'Eric Evans', '9788550800653', 'Arquitetura de Software', 2)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);
