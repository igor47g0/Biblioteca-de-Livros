package com.bibliotech.exception;

/**
 * Exceção lançada quando uma tentativa de cadastro ou atualização utiliza um ISBN já existente no banco de dados.
 * Mapeada para o status HTTP 409 Conflict.
 */
public class DuplicateIsbnException extends RuntimeException {

    public DuplicateIsbnException(String message) {
        super(message);
    }

    public static DuplicateIsbnException forIsbn(String isbn) {
        return new DuplicateIsbnException("Já existe um livro cadastrado com o ISBN informado: " + isbn);
    }
}
