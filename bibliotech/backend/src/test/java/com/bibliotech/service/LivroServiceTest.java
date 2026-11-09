package com.bibliotech.service;

import com.bibliotech.dto.LivroRequestDTO;
import com.bibliotech.dto.LivroResponseDTO;
import com.bibliotech.exception.DuplicateIsbnException;
import com.bibliotech.exception.ResourceNotFoundException;
import com.bibliotech.model.Livro;
import com.bibliotech.repository.LivroRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LivroServiceTest {

    @Mock
    private LivroRepository livroRepository;

    @InjectMocks
    private LivroService livroService;

    private Livro livro;
    private LivroRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        livro = new Livro(1L, "Design Patterns", "GoF", "9780201633610", "Engenharia de Software", 4);
        requestDTO = new LivroRequestDTO("Design Patterns", "GoF", "9780201633610", "Engenharia de Software", 4);
    }

    @Test
    @DisplayName("Deve cadastrar livro com sucesso quando ISBN for único")
    void deveCadastrarLivroComSucesso() {
        when(livroRepository.existsByIsbn("9780201633610")).thenReturn(false);
        when(livroRepository.save(any(Livro.class))).thenReturn(livro);

        LivroResponseDTO response = livroService.cadastrar(requestDTO);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Design Patterns", response.getTitulo());
        verify(livroRepository).save(any(Livro.class));
    }

    @Test
    @DisplayName("Deve lançar DuplicateIsbnException ao tentar cadastrar ISBN já existente")
    void deveLancarExcecaoAoCadastrarIsbnDuplicado() {
        when(livroRepository.existsByIsbn("9780201633610")).thenReturn(true);

        assertThrows(DuplicateIsbnException.class, () -> livroService.cadastrar(requestDTO));
        verify(livroRepository, never()).save(any(Livro.class));
    }

    @Test
    @DisplayName("Deve listar todos os livros cadastrados")
    void deveListarTodosOsLivros() {
        when(livroRepository.findAll()).thenReturn(List.of(livro));

        List<LivroResponseDTO> lista = livroService.listarTodos();

        assertNotNull(lista);
        assertEquals(1, lista.size());
        assertEquals("Design Patterns", lista.get(0).getTitulo());
    }

    @Test
    @DisplayName("Deve buscar livro por ID existente com sucesso")
    void deveBuscarLivroPorIdComSucesso() {
        when(livroRepository.findById(1L)).thenReturn(Optional.of(livro));

        LivroResponseDTO response = livroService.buscarPorId(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    @DisplayName("Deve lançar ResourceNotFoundException ao buscar ID inexistente")
    void deveLancarExcecaoAoBuscarIdInexistente() {
        when(livroRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> livroService.buscarPorId(99L));
    }

    @Test
    @DisplayName("Deve atualizar livro com sucesso")
    void deveAtualizarLivroComSucesso() {
        when(livroRepository.findById(1L)).thenReturn(Optional.of(livro));
        when(livroRepository.existsByIsbnAndIdNot("9780201633610", 1L)).thenReturn(false);
        when(livroRepository.save(any(Livro.class))).thenReturn(livro);

        LivroResponseDTO response = livroService.atualizar(1L, requestDTO);

        assertNotNull(response);
        assertEquals("Design Patterns", response.getTitulo());
    }

    @Test
    @DisplayName("Deve excluir livro existente com sucesso")
    void deveExcluirLivroComSucesso() {
        when(livroRepository.findById(1L)).thenReturn(Optional.of(livro));

        assertDoesNotThrow(() -> livroService.excluir(1L));
        verify(livroRepository).delete(livro);
    }
}
