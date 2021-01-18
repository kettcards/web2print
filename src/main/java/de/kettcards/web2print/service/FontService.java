package de.kettcards.web2print.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.fonts.Font;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Slf4j
@Service
public class FontService {
    @Autowired
    private ResourceLoader resourceLoader;
    @Autowired
    private ObjectMapper objectMapper;

    private final HashMap<String, Font.Provider> fontStore = new HashMap<>(11);

    @PostConstruct
    public void init() throws IOException {
        var resources = new PathMatchingResourcePatternResolver().getResources("classpath:/static/fonts/**");
        log.debug(Arrays.toString(resources));
        for(var resource : resources) {
            var filename = resource.getFilename();
            if (filename == null) {
                log.warn("filename resource is null: " + resource);
                continue;
            }
            try {
                if (filename.equals("font.json")) {
                    Font.Provider provider = objectMapper.readValue(resource.getInputStream(), Font.Provider.class);
                    // (lucas 18.01.21) todo: rework this junk
                    for(var face : provider.getFaces()) {
                        face.setUnderlyingResource(resourceLoader.getResource("classpath:/static/fonts/"+face.getS()));
                    }
                    fontStore.put(provider.getName(), provider);
                }
            } catch (IOException ex) {
                ex.printStackTrace();
                log.warn("unable to read font description file: " + resource);
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
}
