package com.bibliotech.controller;

import com.bibliotech.dto.LivroRequestDTO;
import com.bibliotech.dto.LivroResponseDTO;
import com.bibliotech.exception.DuplicateIsbnException;
import com.bibliotech.exception.GlobalExceptionHandler;
import com.bibliotech.exception.ResourceNotFoundException;
import com.bibliotech.service.LivroService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class LivroControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private LivroService livroService;

    @InjectMocks
    private LivroController livroController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(livroController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /livros - Deve retornar 201 Created quando dados válidos")
    void deveRetornar201AoCadastrarLivroValido() throws Exception {
        LivroRequestDTO request = new LivroRequestDTO("Refactoring", "Martin Fowler", "9780134757599", "Engenharia", 10);
        LivroResponseDTO response = new LivroResponseDTO(1L, "Refactoring", "Martin Fowler", "9780134757599", "Engenharia", 10);

        when(livroService.cadastrar(any(LivroRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/livros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.titulo").value("Refactoring"));
    }

    @Test
    @DisplayName("POST /livros - Deve retornar 400 Bad Request quando dados inválidos")
    void deveRetornar400AoCadastrarDadosInvalidos() throws Exception {
        LivroRequestDTO requestInvalido = new LivroRequestDTO("Oi", "", "", "", -5);

        mockMvc.perform(post("/livros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validacoes").isArray());
    }

    @Test
    @DisplayName("POST /livros - Deve retornar 409 Conflict quando ISBN for duplicado")
    void deveRetornar409AoCadastrarIsbnDuplicado() throws Exception {
        LivroRequestDTO request = new LivroRequestDTO("Refactoring", "Martin Fowler", "9780134757599", "Engenharia", 10);

        when(livroService.cadastrar(any(LivroRequestDTO.class)))
                .thenThrow(new DuplicateIsbnException("Já existe um livro cadastrado com o ISBN informado: 9780134757599"));

        mockMvc.perform(post("/livros")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("GET /livros - Deve retornar 200 OK com lista de livros")
    void deveRetornar200AoListarLivros() throws Exception {
        LivroResponseDTO livro1 = new LivroResponseDTO(1L, "Livro 1", "Autor 1", "1111", "Ficção", 2);
        when(livroService.listarTodos()).thenReturn(List.of(livro1));

        mockMvc.perform(get("/livros"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].titulo").value("Livro 1"));
    }

    @Test
    @DisplayName("GET /livros/{id} - Deve retornar 200 OK quando ID existir")
    void deveRetornar200AoBuscarPorIdExistente() throws Exception {
        LivroResponseDTO livro = new LivroResponseDTO(1L, "Livro 1", "Autor 1", "1111", "Ficção", 2);
        when(livroService.buscarPorId(1L)).thenReturn(livro);

        mockMvc.perform(get("/livros/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("GET /livros/{id} - Deve retornar 404 Not Found quando ID não existir")
    void deveRetornar404AoBuscarPorIdInexistente() throws Exception {
        when(livroService.buscarPorId(99L)).thenThrow(new ResourceNotFoundException(99L));

        mockMvc.perform(get("/livros/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PUT /livros/{id} - Deve retornar 200 OK com JSON atualizado")
    void deveRetornar200AoAtualizarLivro() throws Exception {
        LivroRequestDTO request = new LivroRequestDTO("Refactoring Atualizado", "Martin Fowler", "9780134757599", "Engenharia", 15);
        LivroResponseDTO response = new LivroResponseDTO(1L, "Refactoring Atualizado", "Martin Fowler", "9780134757599", "Engenharia", 15);

        when(livroService.atualizar(eq(1L), any(LivroRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/livros/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Refactoring Atualizado"));
    }

    @Test
    @DisplayName("DELETE /livros/{id} - Deve retornar 204 No Content ao excluir com sucesso")
    void deveRetornar204AoExcluirLivro() throws Exception {
        doNothing().when(livroService).excluir(1L);

        mockMvc.perform(delete("/livros/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /livros/{id} - Deve retornar 404 Not Found ao excluir ID inexistente")
    void deveRetornar404AoExcluirIdInexistente() throws Exception {
        doThrow(new ResourceNotFoundException(99L)).when(livroService).excluir(99L);

        mockMvc.perform(delete("/livros/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
