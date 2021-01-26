package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.fonts.Font;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FontService extends StorageContextAware implements WebContextAware {


    private final ObjectMapper objectMapper;

    private final HashMap<String, Font.Provider> fontStore = new HashMap<>(11);

    public FontService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }


    @Override
    public void initialize(List<Content> contents) {
        var fonts = contents.stream().filter(e ->
                e.getOriginalFilename().equals("font.json")).collect(Collectors.toList());
        for (var font : fonts) {
            try (var stream = font.getInputStream()) {
                Font.Provider fontProvider = objectMapper.readValue(stream, Font.Provider.class);
                for (var face : fontProvider.getFaces()) { //TODO until pdfgen is finished, i keep the rework as a stash
                    //face.setUnderlyingResource(resourceLoader.getResource("classpath:/static/fonts/"+ face.getS()));
                    face.setUnderlyingResource(load(face.getS()));
                }
                fontStore.put(fontProvider.getName(), fontProvider);
            } catch (IOException ex) {
                log.warn("unable to load font definition: " + font.getOriginalFilename(), ex);
            }
        }
    }

    public List<String> listAvailableFonts() {
        return new ArrayList<>(fontStore.keySet());
    }

    public boolean has(String fontName) {
        return fontStore.containsKey(fontName);
    }

    public Font.Provider getProvider(@NonNull String fontName) {
        return fontStore.get(fontName);
    }

    @Override
    public String getNamespace() {
        return "fonts";
    }

}
