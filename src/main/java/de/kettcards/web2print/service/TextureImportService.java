package de.kettcards.web2print.service;

import de.kettcards.web2print.config.ApplicationConfiguration;
import de.kettcards.web2print.exceptions.importer.DatabaseEntryNotFoundException;
import de.kettcards.web2print.model.db.Material;
import de.kettcards.web2print.repository.MaterialRepository;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public final class TextureImportService extends StorageContextAware implements WebContextAware {

    @Autowired
    private ApplicationConfiguration configuration;

    @Autowired
    private MaterialRepository materialRepository;

    public String importTexture(Content content) throws IOException {
        String name = content.getOriginalFilename();
        log.info("importing " + name);
        int lastDotIndex = name.lastIndexOf(".");
        String ending = name.substring(lastDotIndex);
        name = name.substring(0, lastDotIndex);
        name = name.split("_")[0];

        try {
            save(content, name + ending);
        } catch (IOException e) {
            throw new IOException("saving file \"" + name + "\" didn't work");
        }

        //save texture in database if possible
        Material material = materialRepository.findMaterialByName(name);
        if (material == null) {
            throw new DatabaseEntryNotFoundException("file [ " + name + " ] given doesn't have a corresponding database entry");
        }
        material.setTextureSlug(name + ending);
        materialRepository.save(material);

        return "200";
    }

    @Override
    public String getNamespace() {
        return "textures";
    }
}