package de.kettcards.web2print.service;

import de.kettcards.web2print.imports.XLSXImporter;
import lombok.AllArgsConstructor;
import lombok.Data;
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
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class StorageService {

    private Path baseDir;

    @Autowired
    private XLSXImporter importer;

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
        String resourceName = UUID.randomUUID().toString();
        Files.copy(file.getInputStream(), baseDir.resolve(resourceName));
        MetaFile metaFile = new MetaFile(file.getName(), file.getContentType());

        if (file.getContentType().equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            importer.importXlsx(new FileInputStream(baseDir.resolve(resourceName).toFile()));
        }

        resources.put(resourceName, metaFile);
        return resourceName;
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
