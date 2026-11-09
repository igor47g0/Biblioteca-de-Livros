package com.bibliotech.exception;

/**
 * Exceção lançada quando um recurso solicitado (como um ID de livro) não é encontrado no banco de dados.
 * Mapeada para o status HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(Long id) {
        super("Livro não encontrado com o ID: " + id);
    }
}
