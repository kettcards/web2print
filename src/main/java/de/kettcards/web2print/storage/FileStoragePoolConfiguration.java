package de.kettcards.web2print.storage;

import lombok.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * configuration class for {@link FileStoragePool}
 *
 * @author dt
 */
@Value
public class FileStoragePoolConfiguration {

    //valid default directory for storing context
    Path basePath;

    //if a namespace wants to be outside of the base directory it should register
    // its namespace with the corresponding path
    Map<String, Path> namespacePathMap;

    public FileStoragePoolConfiguration(Path basePath) throws IOException {
        this(basePath, Collections.emptyMap());
    }

    public FileStoragePoolConfiguration(String basePath) throws IOException {
        this(basePath, Collections.emptyMap());
    }

    /**
     * configure local storage
     * ensures that:
     * - base path is accessible
     * - path for each namespace is accessible (this includes paths where their namespace is not in use)
     *
     * @param basePath         path to namespace
     * @param namespacePathMap mapped namespace path relation
     * @throws IOException if one of the above requirements is not met
     */
    public FileStoragePoolConfiguration(String basePath, Map<String, Path> namespacePathMap) throws IOException {
        this.basePath = ensurePath(basePath);
        HashMap<String, Path> map = new HashMap<>();
        for (var entry : namespacePathMap.keySet()) {
            map.put(entry, ensurePath(namespacePathMap.get(entry)));
        }
        this.namespacePathMap = map;
    }

    /**
     * configure local storage
     * ensures that:
     * - base path is accessible
     * - path for each namespace is accessible (this includes paths where their namespace is not in use)
     *
     * @param basePath         path to namespace
     * @param namespacePathMap mapped namespace path relation
     * @throws IOException if one of the above requirements is not met
     */
    public FileStoragePoolConfiguration(Path basePath, Map<String, Path> namespacePathMap) throws IOException {
        this.basePath = ensurePath(basePath);
        HashMap<String, Path> map = new HashMap<>();
        for (var entry : namespacePathMap.keySet()) {
            map.put(entry, ensurePath(namespacePathMap.get(entry)));
        }
        this.namespacePathMap = map;
    }

    Path ensurePath(String stringPath) throws IOException {
        Path path = Paths.get(stringPath);
        return ensurePath(path);
    }

    Path ensurePath(Path path) throws IOException {
        Files.createDirectories(path);
        if (!Files.isWritable(path))
            throw new IOException("unable to access path \"" + path + "\"");
        return path;
    }


}
