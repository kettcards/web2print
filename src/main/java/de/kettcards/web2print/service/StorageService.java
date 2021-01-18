package de.kettcards.web2print.service;

import lombok.AllArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.*;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class StorageService {

    private Path baseDir;

    @Autowired
    private XlsxImportService xlsxImportService;

    @Autowired
    private TextureImportService textureImportService;

    @Autowired
    private MotiveImportService motiveImportService;

    private ConcurrentHashMap<String, MetaFile> resources = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() throws IOException {
        baseDir = Files.createTempDirectory("w2p");
        log.info("saving resources under " + baseDir.toAbsolutePath());
    }

    @PreDestroy
    public void stop() throws IOException {
        if (!isRemovable(baseDir))
            log.warn("unable to delete temp resource directory:" + baseDir.toAbsolutePath());
        removeFiles(baseDir); //do it anyways
    }


    /**
     * stores resource
     *
     * @return resource name
     * @throws IOException
     */
    public String store(MultipartFile file) throws IOException {
        String response = "200";
        String resourceName = UUID.randomUUID().toString();
        String originalName = file.getOriginalFilename();
        Files.copy(file.getInputStream(), baseDir.resolve(resourceName));
        MetaFile metaFile = new MetaFile(file.getOriginalFilename(), file.getContentType());

        if (originalName == null) {
            log.warn("file isn't defined or unavailable");
            return "500";
        }

        if (file.getContentType() == null) {
            log.warn("file doesn't have a content type");
            return "500";
        }

        switch (file.getContentType()) {
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                xlsxImportService.importCards(new FileInputStream(baseDir.resolve(resourceName).toFile()));
                break;
            case "image/jpeg":
            case "image/png":
                response = textureImportService.importTexture(new FileInputStream(baseDir.resolve(resourceName).toFile()), originalName);
                break;
            case "application/pdf":
                response = motiveImportService.importMotive(new FileInputStream(baseDir.resolve(resourceName).toFile()), originalName);
                break;
            default:
                response = "415";
                log.warn(file.getContentType() + " is not a valid content type");
                break;
        }

        resources.put(resourceName, metaFile);
        return response;
    }

    /**
     * loads previously stores resource
     *
     * @param resource
     * @return
     * @throws IOException
     */
    public Resource load(String resource) throws IOException {
        return new FileSystemResource(baseDir.resolve(resource));
    }

    private boolean isRemovable(Path path) throws IOException {
        return Files.walk(path).allMatch(Files::isWritable);
    }

    private void removeFiles(Path path) throws IOException {
        Files.walkFileTree(path, new FileVisitor<>() {
            @Override
            public FileVisitResult preVisitDirectory(Path path, BasicFileAttributes basicFileAttributes) throws IOException {
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path path, BasicFileAttributes basicFileAttributes) throws IOException {
                Files.delete(path);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFileFailed(Path path, IOException e) throws IOException {
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path path, IOException e) throws IOException {
                Files.delete(path);
                return FileVisitResult.CONTINUE;
            }
        });
    }


    @Value
    @AllArgsConstructor
    public static class MetaFile {

        String name, contentType;

    }


}
