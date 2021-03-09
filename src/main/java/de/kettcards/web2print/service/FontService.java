package de.kettcards.web2print.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import de.kettcards.web2print.storage.WebContextAware;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.lang.NonNull;
import org.springframework.security.util.InMemoryResource;
import org.springframework.stereotype.Service;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public final class FontService extends StorageContextAware implements WebContextAware {

    private final ObjectMapper objectMapper;

    private final HashMap<String, FontPackage> fontStore = new HashMap<>();

    private final ArrayList<String> order = new ArrayList<>();

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

    /**
     * if there already is a order stored in-memory and it wasn't changed by the admin just return the in-memory order
     * otherwise create a new order list which starts with the fonts explicitly mentioned in orderedFonts.json and put
     * the rest on the tail-end of the list
     * @param newOrder boolean which is set to true when a new order is set
     * @return Fontnames in correct order
     * @throws IOException
     */
    public List<String> listAvailableFonts(boolean newOrder) {
        if(!order.isEmpty() && !newOrder)
            return order;

        ArrayList<String> orderedFonts =  new ArrayList<>();
        try {
            Content content = load("orderedFonts.json");
            orderedFonts = (ArrayList<String>) objectMapper.readValue(content.getInputStream(), new TypeReference<List<String>>() {
            });
        } catch (IOException e) {
            //something went wrong reading the json so we just return the unordered set
            return new ArrayList<>(fontStore.keySet());
        }
        order.clear();
        order.addAll(orderedFonts);
        return orderedFonts;
    }

    public boolean hasFont(String fontName) {
        return fontStore.containsKey(fontName);
    }

    public FontPackage getFont(@NonNull String fontName) {
        return fontStore.get(fontName);
    }

    /**
     * saves fonts in set order into orderedFonts.json located in data/fonts
     * @param fonts fonts in correct order
     * @throws IOException throws exception if either JSON parsing of parameter or saving of the json file fails
     */
    public void saveOrder(String[] fonts) throws IOException {
        String json = objectMapper.writeValueAsString(fonts);
        save(new Content(new InMemoryResource(json)), "orderedFonts.json");
    }

    @Override
    public String getNamespace() {
        return "fonts";
    }

}
