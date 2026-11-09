package com.bibliotech.repository;

import com.bibliotech.model.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Interface de acesso a dados para a entidade Livro.
 * Estende JpaRepository para fornecer operações CRUD seguras e otimizadas.
 * Não utiliza concatenação de texto para consultas, eliminando risco de SQL Injection.
 */
@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {

    /**
     * Verifica se já existe um livro cadastrado com o ISBN especificado (utilizado no cadastro POST).
     */
    boolean existsByIsbn(String isbn);

    /**
     * Busca um livro pelo seu código ISBN.
     */
    Optional<Livro> findByIsbn(String isbn);

    /**
     * Verifica se existe outro livro com o mesmo ISBN porém com ID diferente (utilizado na atualização PUT).
     */
    boolean existsByIsbnAndIdNot(String isbn, Long id);
}
