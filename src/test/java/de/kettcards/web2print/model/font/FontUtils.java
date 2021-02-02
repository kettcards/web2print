package de.kettcards.web2print.model.font;

import de.kettcards.web2print.model.fonts.FontFace;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.model.fonts.FontStyle;
import org.apache.fontbox.ttf.TTFParser;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import java.io.IOException;
import java.util.EnumSet;

public class FontUtils {

    public static final TTFParser ttfParser = new TTFParser();

    public static final String testFontLocation = "/testFonts/";

    public static FontPackage loadTestFont(String fontName) {
       var resolver = new PathMatchingResourcePatternResolver();
        final Resource resource = resolver.getResource("classpath:" + testFontLocation + fontName + "/font.json");
        return null;
    }

    public static TrueTypeFont loadTTF(String classPath) throws IOException {
        var is = new FileSystemResource("src/test/resources".concat(classPath)).getInputStream();
        return ttfParser.parse(is);
    }

    public static FontPackage loadJosefineSlabPackage() throws IOException {
        var base = "/testFonts/josefinslab/static/JosefinSlab-";
        var r = new FontFace(EnumSet.of(FontStyle.NORMAL), FontStyle.getWeight(FontStyle.NORMAL), 1, "undefined", loadTTF(base.concat("Regular.ttf")));
        var b = new FontFace(EnumSet.of(FontStyle.BOLD), FontStyle.getWeight(FontStyle.BOLD), 1, "undefined", loadTTF(base.concat("Bold.ttf")));
        var i = new FontFace(EnumSet.of(FontStyle.ITALIC), FontStyle.getWeight(FontStyle.ITALIC), 1, "undefined", loadTTF(base.concat("Italic.ttf")));
        var bi = new FontFace(EnumSet.of(FontStyle.BOLD, FontStyle.ITALIC), FontStyle.getWeight(FontStyle.BOLD), 1, "undefined", loadTTF(base.concat("BoldItalic.ttf")));
        return new FontPackage("JosefinSlab", r, b, i, bi);
    }

    public static FontPackage loadDummyFontPackage() throws IOException {
        var r = new FontFace(EnumSet.of(FontStyle.NORMAL), 0, 1, "source/target");
        return new FontPackage("dummy", r);
    }


}
