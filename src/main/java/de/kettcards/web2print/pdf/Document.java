package de.kettcards.web2print.pdf;

import de.kettcards.web2print.exceptions.font.FontException;
import de.kettcards.web2print.model.fonts.FontFace;
import de.kettcards.web2print.model.fonts.FontPackage;
import de.kettcards.web2print.model.fonts.FontStyle;
import de.kettcards.web2print.service.FontService;
import de.kettcards.web2print.storage.Content;
import de.kettcards.web2print.storage.StorageContextAware;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;

import java.io.IOException;
import java.util.AbstractMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public class Document extends PDDocument {

    private PDPage currentPage;

    private PDPageContentStream currentPageStream;

    private float xOffset = 0;
    private float yOffset = 0;

    private final Map<String, Map<EnumSet<FontStyle>, AbstractMap.SimpleEntry<PDFont, TrueTypeFont>>> embeddedFonts = new HashMap<>();
    private FontService fontService;
    private StorageContextAware userContent;

    public void setFontService(FontService fontService) {
        this.fontService = fontService;
    }

    public void setUserContent(StorageContextAware userContent) {
        this.userContent = userContent;
    }

    public AbstractMap.SimpleEntry<PDFont, TrueTypeFont> getFont(String fontName, EnumSet<FontStyle> fontStyle) throws IOException {
        var fontPackageMap = embeddedFonts.get(fontName);
        if (fontPackageMap == null || fontPackageMap.get(fontStyle) == null) {
            attemptFontLoading(fontName, fontStyle);
            fontPackageMap = embeddedFonts.get(fontName);
        }
        var font = fontPackageMap.get(fontStyle);
        if (font == null)
            throw new FontException("Font " + fontName + " doesn't support Font Style: " + fontStyle);
        return font;
    }

    public void attemptFontLoading(String fontName, EnumSet<FontStyle> fontStyles) throws IOException {
        if (!fontService.hasFont(fontName)) {
            throw new FontException("unknown Font: " + fontName);
        }
        var fontPackage = fontService.getFont(fontName);
        var fontFace = fontPackage.getFontFace(fontStyles);
        embedFontFace(fontPackage, fontFace);
    }

    public void embedFontPackage(FontPackage fontPackage) throws IOException {
        var fontStyleMap = embeddedFonts.getOrDefault(fontPackage.getName(), new HashMap<>());
        for (var fontFace : fontPackage.getFontFaces()) {
            fontStyleMap.put(fontFace.getFontStyle(), new AbstractMap.SimpleEntry<>(fontFace.embed(this),fontFace.getFont()));
        }
        embeddedFonts.put(fontPackage.getName(), fontStyleMap);
    }

    public void embedFontFace(FontPackage fontPackage, FontFace fontFace, FontFace... fontFaces) throws IOException {
        var fontStyleMap = embeddedFonts.getOrDefault(fontPackage.getName(), new HashMap<>());
        checkAndEmbedFontFace(fontPackage, fontFace, fontStyleMap);
        for (var fontStyle : fontFaces) {
            checkAndEmbedFontFace(fontPackage, fontStyle, fontStyleMap);
        }
        embeddedFonts.put(fontPackage.getName(), fontStyleMap);
    }

    private void checkAndEmbedFontFace(FontPackage fontPackage, FontFace fontFace, Map<EnumSet<FontStyle>, AbstractMap.SimpleEntry<PDFont, TrueTypeFont>> fontStyleMap) throws IOException {
        fontStyleMap.put(fontFace.getFontStyle(), new AbstractMap.SimpleEntry<>(fontFace.embed(this),fontFace.getFont()));
    }

    public void newPage(float width, float height) throws IOException {
        closeCurrentPage();
        this.currentPage = new PDPage(new PDRectangle(width, height));
        this.currentPageStream = new PDPageContentStream(this, currentPage);
    }

    public PDPage page() {
        return currentPage;
    }

    public PDPageContentStream stream() {
        return currentPageStream;
    }

    /**
     * set offset for each {@link BoxData} object
     *
     * @param x x offset in pt
     * @param y y offset in pt
     */
    public void setBoxOffset(float x, float y) {
        xOffset += x;
        yOffset += y;
    }

    /**
     * @return x offset in pt
     */
    public float getXOffset() {
        return xOffset;
    }

    /**
     * @return y offset in pt
     */
    public float getYOffset() {
        return yOffset;
    }

    public Content resolveContent(String contentId) throws IOException {
        return userContent.load(contentId);
    }

    public void closeCurrentPage() throws IOException {
        if (currentPageStream != null) {
            currentPageStream.close();
        }
        if (currentPage != null) {
            this.addPage(currentPage);
        }
    }

    @Override
    public void close() throws IOException {
        closeCurrentPage();
        super.close();
    }

}
