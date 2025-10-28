package com.kosa.board.service;

import com.kosa.board.dto.BoardDTO;
import com.kosa.board.dto.BoardFileDTO;
import com.kosa.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    @Value("${file.upload-dir}")
    private String uploadDir;

    public void save(BoardDTO boardDTO) throws IOException {
        List<MultipartFile> boardFileList = boardDTO.getBoardFile();
        if (boardFileList == null || boardFileList.isEmpty() || boardFileList.get(0).isEmpty()) {
            boardDTO.setFileAttached(0);
            boardRepository.save(boardDTO);
        } else {
            boardDTO.setFileAttached(1);
            BoardDTO savedBoard = boardRepository.save(boardDTO);
            Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadDirPath);
            for (MultipartFile boardFile: boardFileList) {
                String originalFilename = boardFile.getOriginalFilename();
                if (originalFilename == null || originalFilename.isBlank()) {
                    originalFilename = boardFile.getName();
                }
                System.out.println("originalFilename = " + originalFilename);
                System.out.println(System.currentTimeMillis());
                String storedFileName = System.currentTimeMillis() + "-" + originalFilename;
                System.out.println("storedFileName = " + storedFileName);
                BoardFileDTO boardFileDTO = new BoardFileDTO();
                boardFileDTO.setOriginalFileName(originalFilename);
                boardFileDTO.setStoredFileName(storedFileName);
                boardFileDTO.setBoardId(savedBoard.getId());
                Path savePath = uploadDirPath.resolve(storedFileName);
                boardFile.transferTo(savePath.toFile());
                boardRepository.saveFile(boardFileDTO);
            }
        }
    }

    public List<BoardDTO> findAll() {
        return boardRepository.findAll();
    }

    public void updateHits(Long id) {
        boardRepository.updateHits(id);
    }

    public BoardDTO findById(Long id) {
        return boardRepository.findById(id);
    }

    public void update(BoardDTO boardDTO) {
        boardRepository.update(boardDTO);
    }

    public void delete(Long id) {
        boardRepository.delete(id);
    }

    public List<BoardFileDTO> findFile(Long id) {
        return boardRepository.findFile(id);
    }
}
