package com.bibliotech.controller;

import com.bibliotech.dto.LivroRequestDTO;
import com.bibliotech.dto.LivroResponseDTO;
import com.bibliotech.service.LivroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Controller REST para o recurso de livros (/livros).
 * Responsável apenas pela recepção HTTP, validação de entrada (@Valid) e despacho para o Service.
 * Mantém os status HTTP estritamente aderentes ao contrato REST da avaliação:
 * - POST: 201 Created
 * - GET: 200 OK
 * - PUT: 200 OK
 * - DELETE: 204 No Content
 */
@RestController
@RequestMapping("/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    /**
     * Endpoint: POST /livros
     * Operação no Banco: INSERT
     * Resposta esperada: 201 Created com o JSON do livro criado
     */
    @PostMapping
    public ResponseEntity<LivroResponseDTO> cadastrar(@Valid @RequestBody LivroRequestDTO dto) {
        LivroResponseDTO livroCriado = livroService.cadastrar(dto);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(livroCriado.getId())
                .toUri();

        return ResponseEntity.created(location).body(livroCriado);
    }

    /**
     * Endpoint: GET /livros
     * Operação no Banco: SELECT
     * Resposta esperada: 200 OK com a lista em JSON
     */
    @GetMapping
    public ResponseEntity<List<LivroResponseDTO>> listarTodos() {
        List<LivroResponseDTO> lista = livroService.listarTodos();
        return ResponseEntity.ok(lista);
    }

    /**
     * Endpoint: GET /livros/{id}
     * Operação no Banco: SELECT ... WHERE id
     * Resposta esperada: 200 OK com o JSON do livro, ou 404 Not Found se o id não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<LivroResponseDTO> buscarPorId(@PathVariable Long id) {
        LivroResponseDTO livro = livroService.buscarPorId(id);
        return ResponseEntity.ok(livro);
    }

    /**
     * Endpoint: PUT /livros/{id}
     * Operação no Banco: UPDATE
     * Resposta esperada: 200 OK com o JSON atualizado, ou 404 se o id não existir (ou 409 se ISBN duplicado)
     */
    @PutMapping("/{id}")
    public ResponseEntity<LivroResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody LivroRequestDTO dto) {

        LivroResponseDTO livroAtualizado = livroService.atualizar(id, dto);
        return ResponseEntity.ok(livroAtualizado);
    }

    /**
     * Endpoint: DELETE /livros/{id}
     * Operação no Banco: DELETE
     * Resposta esperada: 204 No Content, ou 404 se o id não existir
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        livroService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
