package de.kettcards.web2print.service;

import de.kettcards.web2print.config.Web2PrintApplicationConfiguration;
import de.kettcards.web2print.model.db.Material;
import de.kettcards.web2print.repository.MaterialRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Component
public class TextureImportService {

    @Autowired
    private Web2PrintApplicationConfiguration web2PrintApplicationConfiguration;

    @Autowired
    private MaterialRepository materialRepository;

    private Path folder = Paths.get("textures");

    public String importTexture(InputStream file, String name) {
        log.info("importing " + name);
        int lastDotIndex = name.lastIndexOf(".");
        String ending = name.substring(lastDotIndex);
        name = name.substring(0, lastDotIndex);
        name = name.split("_")[0];

        //save texture locally
        Path filePath;
        try {
            byte[] buffer = new byte[file.available()];
            //noinspection ResultOfMethodCallIgnored
            file.read(buffer);

            //create directory
            //TODO make configurable
            Path folder = Paths.get("textures");
            Files.createDirectories(folder);

            filePath = folder.resolve(name + ending);
            File targetFile = filePath.toFile();
            OutputStream outputStream = new FileOutputStream(targetFile);
            outputStream.write(buffer);
        } catch (IOException e) {
            log.warn("saving file \"" + name + "\" didn't work");
            return "500";
        }

        //save texture in database if possible
        Material material = materialRepository.findMaterialByName(name);
        if (material == null) {
            log.warn("file [ " + name + " ] given doesn't have a corresponding database entry");
            return "500";
        }
        material.setTextureSlug(name + ending);
        materialRepository.save(material);

        return "200";
    }
}