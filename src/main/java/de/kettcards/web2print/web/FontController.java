package de.kettcards.web2print.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.kettcards.web2print.model.fonts.FontPackage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;

@Slf4j
@Component
@RequestMapping("${web2print.links.api-path}")
public class FontController {

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, FontPackage> fontPackageMap = new HashMap<>();

    @PostConstruct
    public void init() throws IOException {
        PathMatchingResourcePatternResolver pathMatchingResourcePatternResolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = pathMatchingResourcePatternResolver.getResources("classpath:/static/fonts/**");
        log.debug(Arrays.toString(resources));
        for (Resource resource : resources) {
            String filename = resource.getFilename();
            if (filename == null) {
                log.warn("filename resource is null:" + resource);
                continue;
            }
            try {
                if (filename.equals("font.json")) {
                    FontPackage fontPackage = objectMapper.readValue(resource.getInputStream(), FontPackage.class);
                    fontPackageMap.put(fontPackage.getName(), fontPackage);
                }
            } catch (IOException ex) {
                ex.printStackTrace();
                log.warn("unable to read font description file: " + resource);
            }
        }
    }

    @GetMapping("/fonts")
    public ResponseEntity<List<String>> getFonts() {
        var fonts = new ArrayList<String>();
        fonts.addAll(fontPackageMap.keySet());
        log.debug(fonts.toString());
        return ResponseEntity.ok(fonts);
    }

    @GetMapping("/font/{fontId}")
    public ResponseEntity<FontPackage> getFonts(@PathVariable("fontId") String fontId) {
        FontPackage fontPackage = fontPackageMap.get(fontId);
        log.debug(fontPackage.toString());
        return ResponseEntity.ok(fontPackage);
    }

}
