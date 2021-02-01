package de.kettcards.web2print.storage;

import org.springframework.core.io.FileSystemResource;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;

/**
 * file based {@link Content} storage implementation,
 * if the storage configuration doesn't specify another storage location for a namespace
 * a directory with the same name as the namespace will be created,
 * non-defined namespaces are created under {@link FileStoragePoolConfiguration#getBasePath()},
 * by default the base directory is ".pool_data" inside the current working directory
 *
 * @author dt
 */
public class FileStoragePool extends StoragePool {

    protected final FileStoragePoolConfiguration poolConfiguration;

    public FileStoragePool() throws IOException {
        this(new FileStoragePoolConfiguration(".pool_data"));
    }

    public FileStoragePool(FileStoragePoolConfiguration poolConfiguration) throws IOException {
        this.poolConfiguration = poolConfiguration;
    }

    @Override
    public void registerStorageContext(StorageContext storageContext) throws IOException {
        super.registerStorageContext(storageContext);
        //initialize default namespace
        Files.createDirectories(determineContextDirectory(storageContext));

        //collect entire content
        storageContext.initialize(listContent(storageContext));
    }

    @Override
    protected void cleanContext(StorageContext storageContext) throws IOException {
        Path contentPath = determineContextDirectory(storageContext);
        FileSystemUtils.deleteRecursively(contentPath);
        Files.createDirectories(contentPath);
    }

    @Override
    public Map<String, String> getNamespaceWebMatchingContext() {
        Map<String, String> map = new HashMap<>();
        for (var entry : storageContextMap.keySet()) {
            if (entry instanceof WebContextAware) {
                Path contextDirectory = determineContextDirectory(entry);
                var endpoint = ((WebContextAware) entry).exposeTo();
                map.put("/" + endpoint + "/**", contextDirectory.toString().concat("/").replace('\\', '/'));
            }
        }
        return map;
    }

    /**
     * @param storageContext current context
     * @return list of content for the entire context
     */
    public List<Content> listContent(StorageContext storageContext) throws IOException {
        Path contentPath = determineContextDirectory(storageContext);
        List<Content> contentList = new LinkedList<>();
        Files.walkFileTree(contentPath, new SimpleFileVisitor<>() {

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                super.visitFile(file, attrs);
                var contentType = Files.probeContentType(file);
                var resource = new FileSystemResource(file);
                contentList.add(new Content(resource, contentType, file.getFileName().toString(), Collections.emptyList()));
                return FileVisitResult.CONTINUE;
            }

        });
        return contentList;
    }

    /**
     * determines the path by taking storage context and namespace configuration into consideration
     *
     * @param storageContext current context
     * @return target directory
     */
    protected Path determineContextDirectory(StorageContext storageContext) {
        return poolConfiguration
                .getNamespacePathMap().getOrDefault(storageContext.getNamespace(), //custom pool config lookup
                        poolConfiguration.getBasePath().resolve(storageContext.getNamespace())); //default namespace

    }

    /**
     * ensures that content name inside path directory
     *
     * @param path        directory
     * @param contentName content name
     * @return resolves content name for given path
     * @throws IOException if the resolved path is outside the given directory path
     */
    protected Path safeResolveContentName(Path path, String contentName) throws IOException {
        Path contentPath = path.resolve(contentName).toAbsolutePath();
        if (!contentPath.startsWith(path.toAbsolutePath()))
            throw new IOException("\"" + contentName + "\" exceeds bound for path:" + path.toAbsolutePath());
        return contentPath;
    }

    /**
     * saves given content as file
     * {@inheritDoc}
     */
    @Override
    public void save(StorageContext storageContext, Content content, String contentName) throws IOException {
        Path contextDirectory = determineContextDirectory(storageContext);
        Path resolve = safeResolveContentName(contextDirectory, contentName);
        try (var stream = content.getInputStream()) {
            Files.copy(stream, resolve, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /**
     * loads content from file
     * {@inheritDoc}
     */
    @Override
    public Content load(StorageContext storageContext, String contentName) throws IOException {
        Path contextDirectory = determineContextDirectory(storageContext);
        Path resolve = safeResolveContentName(contextDirectory, contentName);
        if (!Files.exists(resolve) || !Files.isRegularFile(resolve) || !Files.isReadable(resolve))
            throw new IOException("unable to load requested file \"" + contentName + "\"");
        var contentType = Files.probeContentType(resolve);
        var resource = new FileSystemResource(resolve);
        Content content = new Content(resource, contentType, contentName, Collections.emptyList());//TODO constrain checking/setting
        return content;
    }

    /**
     * delete file
     * {@inheritDoc}
     */
    @Override
    public boolean delete(StorageContext storageContext, String contentName) throws IOException {
        Path contextDirectory = determineContextDirectory(storageContext);
        Path resolve = safeResolveContentName(contextDirectory, contentName);
        if (!Files.exists(resolve))
            return true;
        FileSystemUtils.deleteRecursively(resolve);
        return true;
    }

}