package com.bibliotech.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Objeto de Transferência de Dados para cadastro e atualização de Livro.
 * Contém anotações de Bean Validation (Jakarta Validation) para integridade de dados.
 */
public class LivroRequestDTO {

    @NotBlank(message = "O título é obrigatório.")
    @Size(min = 3, max = 150, message = "O título deve possuir entre 3 e 150 caracteres.")
    private String titulo;

    @NotBlank(message = "O autor é obrigatório.")
    private String autor;

    @NotBlank(message = "O ISBN é obrigatório.")
    private String isbn;

    @NotBlank(message = "O gênero é obrigatório.")
    private String genero;

    @NotNull(message = "O número de exemplares é obrigatório.")
    @Min(value = 0, message = "O número de exemplares deve ser um número inteiro maior ou igual a 0.")
    private Integer exemplares;

    public LivroRequestDTO() {
    }

    public LivroRequestDTO(String titulo, String autor, String isbn, String genero, Integer exemplares) {
        this.titulo = titulo;
        this.autor = autor;
        this.isbn = isbn;
        this.genero = genero;
        this.exemplares = exemplares;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public Integer getExemplares() {
        return exemplares;
    }

    public void setExemplares(Integer exemplares) {
        this.exemplares = exemplares;
    }
}
