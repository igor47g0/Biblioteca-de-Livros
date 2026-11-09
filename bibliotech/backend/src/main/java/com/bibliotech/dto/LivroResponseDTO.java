package com.bibliotech.dto;

import com.bibliotech.model.Livro;

/**
 * Objeto de Transferência de Dados de resposta com os dados expostos do Livro.
 */
public class LivroResponseDTO {

    private Long id;
    private String titulo;
    private String autor;
    private String isbn;
    private String genero;
    private Integer exemplares;

    public LivroResponseDTO() {
    }

    public LivroResponseDTO(Long id, String titulo, String autor, String isbn, String genero, Integer exemplares) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.isbn = isbn;
        this.genero = genero;
        this.exemplares = exemplares;
    }

    public LivroResponseDTO(Livro livro) {
        if (livro != null) {
            this.id = livro.getId();
            this.titulo = livro.getTitulo();
            this.autor = livro.getAutor();
            this.isbn = livro.getIsbn();
            this.genero = livro.getGenero();
            this.exemplares = livro.getExemplares();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
