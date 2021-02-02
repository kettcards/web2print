package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FontService extends StorageContextAware implements WebContextAware {

    private final ObjectMapper objectMapper;

    private final HashMap<String, FontPackage> fontStore = new HashMap<>();

    public FontService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void initialize(List<Content> contents) {
        var fonts = contents.stream().filter(e ->
                e.getOriginalFilename().equals("font.json")).collect(Collectors.toList());
        for (var font : fonts) {
            try (var stream = font.getInputStream()) {
                var fontPackage = objectMapper.readValue(stream, FontPackage.class);
                for (var fontFace : fontPackage.getFontFaces()) {
                    var source = fontFace.getSource();
                    //var context = font.getRelativePath(source); //TODO only works with newer pool, set the path over the name
                    fontFace.load(load(fontPackage.getName().toLowerCase() + "/" + source).getInputStream());
                }
                fontStore.put(fontPackage.getName(), fontPackage);
            } catch (Exception ex) {
                log.warn("unable to load font definition: " + font.getOriginalFilename(), ex); //TODO use relative path resolving
            }
        }
    }

    public List<String> listAvailableFonts() {
        return new ArrayList<>(fontStore.keySet());
    }

    public boolean hasFont(String fontName) {
        return fontStore.containsKey(fontName);
    }

    public FontPackage getFont(@NonNull String fontName) {
        return fontStore.get(fontName);
    }


    @Override
    public String getNamespace() {
        return "fonts";
    }

}
