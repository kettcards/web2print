package de.kettcards.web2print.web;

import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.service.FontService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("${web2print.links.api-path}")
public final class FontController {

    @Autowired
    private ResourceLoader resourceLoader;

    private final FontService fontService;

    private boolean newOrder = false;

    public FontController(FontService fontService) {
        this.fontService = fontService;
    }

    /**
     * @return the names of available fonts
     */
    @GetMapping({"/font", "/fonts"})
    public List<String> getFonts() throws IOException {
        List<String> list = fontService.listAvailableFonts(newOrder);
        newOrder = false;
        return list;
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

    @PostMapping("/defaultFonts")
    public void setDefaultFonts(@RequestBody String[] fonts) throws IOException {
        fontService.saveOrder(fonts);
        newOrder = true;
    }

}
