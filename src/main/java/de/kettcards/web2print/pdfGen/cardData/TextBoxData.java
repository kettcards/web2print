package de.kettcards.web2print.pdfGen.cardData;

import lombok.Data;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static de.kettcards.web2print.pdfGen.PDFGenerator.mm2pt;

@Data
public class TextBoxData {
    private final float x, y, w, h;
    private final char alignment;
    private final List<TextRunData> textRuns;
    private float offX = 0, offY = 0;

    public TextBoxData(float x, float y, float w, float h, char alignment) {
        this(x, y, w, h, alignment, new ArrayList<>());
    }

    public TextBoxData(float x, float y, float w, float h, char alignment, List<TextRunData> textRuns) {
        this.x = x;
        this.y = y;
        offX = mm2pt(x);
        offY = mm2pt(y);
        this.w = w;
        this.h = h;
        this.alignment = alignment;
        this.textRuns = textRuns;
    }

    public void applyTo(PDPageContentStream content) throws IOException {
        switch (alignment) {
            case 'l':
                content.newLineAtOffset(offX, offY);
                break;
            case 'r':
                content.newLineAtOffset(w, offY);
                break;
            case 'c':
                content.newLineAtOffset(w/2, offY);
                break;
            case 'j':
                content.newLineAtOffset(offX, offY);
                break;
            default:
                content.newLineAtOffset(offX, offY);
                break;
        }
    }
}
