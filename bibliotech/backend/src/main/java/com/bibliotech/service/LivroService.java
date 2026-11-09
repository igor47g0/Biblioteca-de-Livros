package com.bibliotech.service;

import com.bibliotech.dto.LivroRequestDTO;
import com.bibliotech.dto.LivroResponseDTO;
import com.bibliotech.exception.DuplicateIsbnException;
import com.bibliotech.exception.ResourceNotFoundException;
import com.bibliotech.model.Livro;
import com.bibliotech.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Camada de serviço responsável por isolar as regras de negócio da aplicação.
 * Toda a validação lógica (ISBN duplicado, existência de IDs) é concentrada nesta camada,
 * evitando acoplamento indevido ou regras de negócio no Controller.
 */
@Service
public class LivroService {

    private final LivroRepository livroRepository;

    public LivroService(LivroRepository livroRepository) {
        this.livroRepository = livroRepository;
    }

    /**
     * Retorna a lista completa de livros cadastrados no acervo.
     */
    @Transactional(readOnly = true)
    public List<LivroResponseDTO> listarTodos() {
        return livroRepository.findAll()
                .stream()
                .map(LivroResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Busca um livro pelo seu ID identificador.
     * Lança ResourceNotFoundException (HTTP 404) caso o ID não exista.
     */
    @Transactional(readOnly = true)
    public LivroResponseDTO buscarPorId(Long id) {
        Livro livro = buscarEntidadePorId(id);
        return new LivroResponseDTO(livro);
    }

    /**
     * Cadastra um novo livro no acervo.
     * Valida unicidade de ISBN: se já existir, lança DuplicateIsbnException (HTTP 409).
     */
    @Transactional
    public LivroResponseDTO cadastrar(LivroRequestDTO dto) {
        // Validação da regra de unicidade de ISBN no cadastro
        if (livroRepository.existsByIsbn(dto.getIsbn().trim())) {
            throw DuplicateIsbnException.forIsbn(dto.getIsbn().trim());
        }

        Livro novoLivro = new Livro(
                dto.getTitulo().trim(),
                dto.getAutor().trim(),
                dto.getIsbn().trim(),
                dto.getGenero().trim(),
                dto.getExemplares()
        );

        Livro livroSalvo = livroRepository.save(novoLivro);
        return new LivroResponseDTO(livroSalvo);
    }

    /**
     * Atualiza os dados de um livro existente.
     * Valida existência do livro (HTTP 404) e unicidade de ISBN em relação a outros livros (HTTP 409).
     */
    @Transactional
    public LivroResponseDTO atualizar(Long id, LivroRequestDTO dto) {
        Livro livro = buscarEntidadePorId(id);

        String novoIsbn = dto.getIsbn().trim();

        // Verifica se outro livro com ID diferente já utiliza este mesmo ISBN
        if (livroRepository.existsByIsbnAndIdNot(novoIsbn, id)) {
            throw DuplicateIsbnException.forIsbn(novoIsbn);
        }

        livro.setTitulo(dto.getTitulo().trim());
        livro.setAutor(dto.getAutor().trim());
        livro.setIsbn(novoIsbn);
        livro.setGenero(dto.getGenero().trim());
        livro.setExemplares(dto.getExemplares());

        Livro livroAtualizado = livroRepository.save(livro);
        return new LivroResponseDTO(livroAtualizado);
    }

    /**
     * Exclui um livro pelo ID.
     * Valida se o livro existe antes de excluir (HTTP 404 caso não exista).
     */
    @Transactional
    public void excluir(Long id) {
        Livro livro = buscarEntidadePorId(id);
        livroRepository.delete(livro);
    }

    /**
     * Método auxiliar interno para buscar a entidade por ID ou lançar exceção 404.
     */
    private Livro buscarEntidadePorId(Long id) {
        return livroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }
}
