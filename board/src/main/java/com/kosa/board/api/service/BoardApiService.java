package com.kosa.board.api.service;

import com.kosa.board.api.dto.BoardRequest;
import com.kosa.board.api.dto.BoardResponse;
import com.kosa.board.api.exception.ResourceNotFoundException;
import com.kosa.board.dto.BoardDTO;
import com.kosa.board.dto.BoardFileDTO;
import com.kosa.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardApiService {
    private final BoardRepository boardRepository;
    private final FileStorageService fileStorageService;

    public List<BoardResponse> getAllBoards() {
        return boardRepository.findAll()
                .stream()
                .map(BoardResponse::from)
                .collect(Collectors.toList());
    }

    public BoardResponse getBoard(Long id) {
        BoardDTO boardDTO = findBoardOrThrow(id);
        var fileDTOs = boardRepository.findFile(id);
        return BoardResponse.of(boardDTO, fileDTOs);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BoardResponse createBoard(BoardRequest request) {
        BoardDTO boardDTO = new BoardDTO();
        boardDTO.setBoardWriter(request.getBoardWriter());
        boardDTO.setBoardPass(request.getBoardPass());
        boardDTO.setBoardTitle(request.getBoardTitle());
        boardDTO.setBoardContents(request.getBoardContents());
        boardDTO.setBoardHits(0);
        boardDTO.setFileAttached(0);

        BoardDTO saved = boardRepository.save(boardDTO);
        BoardDTO persisted = boardRepository.findById(saved.getId());
        return BoardResponse.from(persisted != null ? persisted : saved);
    }

    /**
     * 게시글 생성 + 첨부파일 처리 (API 호환성 유지를 위해 오버로드 제공)
     * - 파일 저장은 FileStorageService에 위임하여 IO를 분리합니다.
     * - DB에는 원본 파일명/저장 파일명만 저장합니다.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public BoardResponse createBoard(BoardRequest request, List<MultipartFile> files) {
        BoardDTO boardDTO = new BoardDTO();
        boardDTO.setBoardWriter(request.getBoardWriter());
        boardDTO.setBoardPass(request.getBoardPass());
        boardDTO.setBoardTitle(request.getBoardTitle());
        boardDTO.setBoardContents(request.getBoardContents());

        boolean hasFiles = files != null && !files.isEmpty() && files.stream().anyMatch(f -> f != null && !f.isEmpty());
        boardDTO.setFileAttached(hasFiles ? 1 : 0);

        BoardDTO saved = boardRepository.save(boardDTO);

        if (hasFiles) {
            Long boardId = saved.getId();
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                var uploadResult = fileStorageService.store(file);
                String fileUrl = uploadResult.getFileUrl();
                String storedFileName = fileUrl != null && fileUrl.contains("/")
                        ? fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
                        : fileUrl;

                BoardFileDTO fileDTO = new BoardFileDTO();
                fileDTO.setBoardId(boardId);
                fileDTO.setOriginalFileName(uploadResult.getFileName());
                fileDTO.setStoredFileName(storedFileName);
                boardRepository.saveFile(fileDTO);
            }
        }

        BoardDTO persisted = boardRepository.findById(saved.getId());
        return BoardResponse.from(persisted != null ? persisted : saved);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public BoardResponse updateBoard(Long id, com.kosa.board.api.dto.BoardUpdateRequest request) {
        BoardDTO existing = findBoardOrThrow(id);
        // Required fields (validated in DTO)
        existing.setBoardTitle(request.getBoardTitle());
        existing.setBoardContents(request.getBoardContents());
        // Optional fields: only update when provided (mapper may ignore these columns)
        if (request.getBoardWriter() != null) {
            existing.setBoardWriter(request.getBoardWriter());
        }
        if (request.getBoardPass() != null) {
            existing.setBoardPass(request.getBoardPass());
        }

        boardRepository.update(existing);
        BoardDTO updated = boardRepository.findById(id);
        return BoardResponse.from(updated != null ? updated : existing);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteBoard(Long id) {
        findBoardOrThrow(id);
        boardRepository.delete(id);
    }

    private BoardDTO findBoardOrThrow(Long id) {
        BoardDTO boardDTO = boardRepository.findById(id);
        if (boardDTO == null) {
            throw new ResourceNotFoundException("Board not found with id " + id);
        }
        return boardDTO;
    }
}
