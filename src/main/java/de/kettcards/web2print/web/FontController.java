package de.kettcards.web2print.web;

import de.kettcards.web2print.model.fonts.Font;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.service.FontService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}")
public class FontController {

    @Autowired
    private ResourceLoader resourceLoader;

    private final FontService fontService;

    public FontController(FontService fontService) {
        this.fontService = fontService;
    }

    /**
     * @return the names of available fonts
     */
    @GetMapping({"/font", "/fonts"})
    public List<String> getFonts() {
        return fontService.listAvailableFonts();
    }

    @GetMapping("/font/{fontName}")
    public FontPackage getFonts(@PathVariable("fontName") String fontId) {
        return fontService.getFont(fontId);
    }

    @GetMapping("/font/{fontId}/source")
    public Resource getFont(@PathVariable("fontId") String fontId) {
        //TODO impl, use it later for loading resource from different types
        return null;
    }

}
