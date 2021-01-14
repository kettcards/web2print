package de.kettcards.web2print.pdfGen.cardData;

import lombok.Value;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import java.util.ArrayList;
import java.util.List;

import static de.kettcards.web2print.pdfGen.PDFGenerator.mm2pt;

@Value
public class CardData {
    int version;

    float pageWidth;
    float pageHeight;

    List<TextBoxData> textBoxes;

    public CardData(int version, float pageWidth, float pageHeight) {
        if (version != 0)
            throw new IllegalArgumentException("version must be 0 but is " + version);
        this.version = version;
        this.pageWidth = pageWidth;
        this.pageHeight = pageHeight;
        textBoxes = new ArrayList<>();
    }

    public PDRectangle getPageBounds() {
        return new PDRectangle(mm2pt(pageWidth), mm2pt(pageHeight));
    }
}

