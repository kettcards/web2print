package de.kettcards.web2print.pdf;

import de.kettcards.web2print.service.FontService;
import de.kettcards.web2print.web.ContentController;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public final class PDFGenerator {

    private final FontService fontService;

    private final ContentController contentController;

    public PDFGenerator(FontService fontService, ContentController contentController) {
        this.fontService = fontService;
        this.contentController = contentController;
    }

    /**
     * @param mm mm value
     * @return converts given mm value into pt
     */
    public static float mm2pt(float mm) {
        return mm / 25.4f * 72.0f;
    }

    public PDDocument generate(CardData cardData) throws IOException {
        final Document document = new Document();
        document.setFontService(fontService);
        document.setUserContent(contentController);
        generate(document, cardData);
        return document;
    }

    private void generate(Document document, CardData cardData) throws IOException {
        cardData.apply(document);
    }

}
